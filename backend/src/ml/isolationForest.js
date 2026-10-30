/**
 * Isolation Forest for Pre-Payment Anomaly Detection
 * 
 * Based on Liu, Ting & Zhou (2008) "Isolation Forest":
 * Anomalies are 'few and different', meaning they isolate closer to the root of randomized trees.
 * s(x, n) = 2^(- E(h(x)) / c(n))
 */

class IsolationTreeNode {
  constructor(size) {
    this.size = size;
    this.splitFeature = null;
    this.splitValue = null;
    this.left = null;
    this.right = null;
    this.isLeaf = false;
  }
}

// Average path length of unsuccessful search in BST
function c(n) {
  if (n <= 1) return 0;
  if (n === 2) return 1;
  const euler = 0.5772156649;
  return 2 * (Math.log(n - 1) + euler) - (2 * (n - 1) / n);
}

export class IsolationTree {
  constructor(maxDepth) {
    this.maxDepth = maxDepth;
    this.root = null;
  }

  fit(data, currentDepth = 0) {
    const n = data.length;
    const node = new IsolationTreeNode(n);

    if (currentDepth >= this.maxDepth || n <= 1) {
      node.isLeaf = true;
      return node;
    }

    // Select random feature index
    const numFeatures = data[0].length;
    const featureIdx = Math.floor(Math.random() * numFeatures);
    node.splitFeature = featureIdx;

    // Find min and max for this feature
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < n; i++) {
      const val = data[i][featureIdx];
      if (val < min) min = val;
      if (val > max) max = val;
    }

    if (min === max) {
      node.isLeaf = true;
      return node;
    }

    // Pick uniform random split value
    node.splitValue = min + Math.random() * (max - min);

    const leftData = [];
    const rightData = [];

    for (let i = 0; i < n; i++) {
      if (data[i][featureIdx] < node.splitValue) {
        leftData.push(data[i]);
      } else {
        rightData.push(data[i]);
      }
    }

    if (leftData.length === 0 || rightData.length === 0) {
      node.isLeaf = true;
      return node;
    }

    node.left = this.fit(leftData, currentDepth + 1);
    node.right = this.fit(rightData, currentDepth + 1);
    return node;
  }

  pathLength(sample, node, currentDepth = 0) {
    if (!node || node.isLeaf || node.splitFeature === null) {
      return currentDepth + (node ? c(node.size) : 0);
    }

    if (sample[node.splitFeature] < node.splitValue) {
      return this.pathLength(sample, node.left, currentDepth + 1);
    } else {
      return this.pathLength(sample, node.right, currentDepth + 1);
    }
  }
}

export class IsolationForest {
  constructor(nTrees = 40, subSampleSize = 128) {
    this.nTrees = nTrees;
    this.subSampleSize = subSampleSize;
    this.trees = [];
    this.fitted = false;
  }

  fit(data) {
    if (!data || data.length === 0) return;
    const n = data.length;
    const sampleSize = Math.min(n, this.subSampleSize);
    const maxDepth = Math.ceil(Math.log2(sampleSize));

    this.trees = [];
    for (let i = 0; i < this.nTrees; i++) {
      // Subsample without replacement
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      const subSample = shuffled.slice(0, sampleSize);

      const tree = new IsolationTree(maxDepth);
      tree.root = tree.fit(subSample, 0);
      this.trees.push(tree);
    }
    this.fitted = true;
  }

  predictAnomalyScore(sample) {
    if (!this.fitted || this.trees.length === 0) {
      return 0.5; // fallback neutral score
    }

    let totalPathLength = 0;
    for (const tree of this.trees) {
      totalPathLength += tree.pathLength(sample, tree.root, 0);
    }

    const avgPathLength = totalPathLength / this.trees.length;
    const cn = c(this.subSampleSize);
    
    if (cn === 0) return 0.5;

    // Anomaly score: closer to 1 means highly anomalous; closer to 0 means normal
    const score = Math.pow(2, - (avgPathLength / cn));
    return Math.max(0, Math.min(1, score));
  }
}

