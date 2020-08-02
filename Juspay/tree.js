class Node {
    constructor(data) {
        this.data = data;
        this.lock = 0; // Atomic
        this.parent = null;
        this.lockedChildren = 0; // Atomic
        this.children = [];
    }
}

function lock(start) {
    if (start.lock) return "Already locked";
    if (start.lockedChildren) return "One of the child node is locked";
    start.lock += 1;
    let canBeLocked = true;
    let node = start.parent;
    while (node) {
        canBeLocked = !node.lock || !(start.lock > 1);
        if (!canBeLocked) break;
        node.lockedChildren += 1;
        node = node.parent;
    }
    if (!canBeLocked) {
        start.lock -= 1;
        node = start.parent;
        while (node && !node.lock) {
            node.lockedChildren -= 1;
            node = node.parent;
        }
        return "Unable to lock because parent node locked";
    }
    return "Lock successful";
}

function unlock(start) {
    if (!start.lock) return "Already unlocked";
    start.lock = 0;
    let node = start.parent;
    while (node) {
        node.lockedChildren -= 1;
        node = node.parent;
    }
    return "Unlock successful";
}

const SAMPLE_DATA = {
    A: {
        C: {
            G: {
                I: null,
                J: null
            },
            H: {
                I: null,
                J: null
            },
        },
        D: {
            G: {
                I: null,
                J: null
            },
            H: {
                I: null,
                J: null
            },
        }
    },
    B: {
        E: {
            G: {
                I: null,
                J: null
            },
            H: {
                I: null,
                J: null
            },
        },
        F: {
            G: {
                I: null,
                J: null
            },
            H: {
                I: null,
                J: null
            },
        },
    }
}

function createTree(value, data, parent = null) {
    const node = new Node(value);
    node.parent = parent;
    node.children = data ? Object.keys(data).map(key => createTree(key, data[key], node)) : [];
    return node;
}

const tree = createTree("Tree", SAMPLE_DATA);