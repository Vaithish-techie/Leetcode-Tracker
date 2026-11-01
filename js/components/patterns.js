// Master Patterns
const CORE_PATTERNS = [
  {
    id: 1,
    name: "Two Pointers",
    mastery: "New",
    category: "Arrays",
    boilerplate: "// Two Pointers — O(n) time, O(1) space\nint twoSum_sorted(vector<int>& arr, int target) {\n    int left = 0, right = (int)arr.size() - 1;\n    while (left < right) {\n        int sum = arr[left] + arr[right];\n        if (sum == target)  return left;\n        else if (sum < target) left++;\n        else right--;\n    }\n    return -1;\n}\n\n// Variant: remove duplicates in-place\nint removeDuplicates(vector<int>& nums) {\n    if (nums.empty()) return 0;\n    int slow = 0;\n    for (int fast = 1; fast < (int)nums.size(); fast++) {\n        if (nums[fast] != nums[slow]) nums[++slow] = nums[fast];\n    }\n    return slow + 1;\n}",
    intuition: "Reduce an O(n^2) brute force to O(n) by exploiting sorted order — moving one pointer inward eliminates an entire sub-problem at each step.",
    whenToUse: "Sorted array/string; finding pairs/triplets with a target sum; removing duplicates in-place; palindrome check; container-with-most-water style problems. Keywords: 'sorted', 'pair', 'two numbers', 'reverse in-place'.",
    mistakes: "Forgetting to sort first; off-by-one on loop condition (use < not <=); moving both pointers in same step; not handling duplicates when answer requires unique pairs.",
    questions: [
      { name: "Two Sum II – Input Array Is Sorted", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/", difficulty: "M" },
      { name: "3Sum", url: "https://leetcode.com/problems/3sum/", difficulty: "M" },
      { name: "Container With Most Water", url: "https://leetcode.com/problems/container-with-most-water/", difficulty: "M" },
      { name: "Valid Palindrome", url: "https://leetcode.com/problems/valid-palindrome/", difficulty: "E" },
      { name: "Trapping Rain Water", url: "https://leetcode.com/problems/trapping-rain-water/", difficulty: "H" },
      { name: "Remove Duplicates from Sorted Array", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/", difficulty: "E" }
    ]
  },
  {
    id: 2,
    name: "Sliding Window (Fixed)",
    mastery: "New",
    category: "Arrays",
    boilerplate: "// Fixed-size sliding window — O(n) time, O(1) space\ndouble maxAvgSubarray(vector<int>& nums, int k) {\n    double windowSum = 0;\n    for (int i = 0; i < k; i++) windowSum += nums[i];\n    double maxSum = windowSum;\n    for (int i = k; i < (int)nums.size(); i++) {\n        windowSum += nums[i] - nums[i - k];\n        maxSum = max(maxSum, windowSum);\n    }\n    return maxSum / k;\n}",
    intuition: "When the window size is fixed at k, add one element and remove one per step — recomputing from scratch is wasteful.",
    whenToUse: "Max/min/average of every contiguous subarray of exactly size k. Keywords: 'subarray of length k', 'consecutive k elements'.",
    mistakes: "Using variable window template when k is fixed; forgetting to subtract the element leaving; integer overflow when summing.",
    questions: [
      { name: "Maximum Average Subarray I", url: "https://leetcode.com/problems/maximum-average-subarray-i/", difficulty: "E" },
      { name: "Find All Anagrams in a String", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/", difficulty: "M" },
      { name: "Permutation in String", url: "https://leetcode.com/problems/permutation-in-string/", difficulty: "M" },
      { name: "Sliding Window Maximum", url: "https://leetcode.com/problems/sliding-window-maximum/", difficulty: "H" },
      { name: "Grumpy Bookstore Owner", url: "https://leetcode.com/problems/grumpy-bookstore-owner/", difficulty: "M" }
    ]
  },
  {
    id: 3,
    name: "Sliding Window (Variable)",
    mastery: "New",
    category: "Arrays",
    boilerplate: "// Variable-size sliding window — O(n) time\nint lengthOfLongestSubstring(string s) {\n    unordered_map<char,int> freq;\n    int left = 0, ans = 0;\n    for (int right = 0; right < (int)s.size(); right++) {\n        freq[s[right]]++;\n        while (freq[s[right]] > 1) {\n            freq[s[left]]--;\n            if (freq[s[left]] == 0) freq.erase(s[left]);\n            left++;\n        }\n        ans = max(ans, right - left + 1);\n    }\n    return ans;\n}\n\n// Template: at most K distinct\nint atMostK(vector<int>& arr, int k) {\n    unordered_map<int,int> cnt;\n    int left = 0, ans = 0;\n    for (int right = 0; right < (int)arr.size(); right++) {\n        cnt[arr[right]]++;\n        while ((int)cnt.size() > k) {\n            if (--cnt[arr[left]] == 0) cnt.erase(arr[left]);\n            left++;\n        }\n        ans = max(ans, right - left + 1);\n    }\n    return ans;\n}",
    intuition: "Expand right to explore, shrink left to restore validity. The window is always the largest valid sub-range ending at 'right'.",
    whenToUse: "Longest/shortest contiguous subarray/substring satisfying a constraint. Keywords: 'longest subarray with', 'minimum window', 'at most k distinct'.",
    mistakes: "Recording answer before shrinking; shrinking with 'if' instead of 'while'; not handling no-valid-window case.",
    questions: [
      { name: "Longest Substring Without Repeating Characters", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", difficulty: "M" },
      { name: "Minimum Window Substring", url: "https://leetcode.com/problems/minimum-window-substring/", difficulty: "H" },
      { name: "Longest Repeating Character Replacement", url: "https://leetcode.com/problems/longest-repeating-character-replacement/", difficulty: "M" },
      { name: "Fruit Into Baskets", url: "https://leetcode.com/problems/fruit-into-baskets/", difficulty: "M" },
      { name: "Max Consecutive Ones III", url: "https://leetcode.com/problems/max-consecutive-ones-iii/", difficulty: "M" },
      { name: "Subarrays with K Different Integers", url: "https://leetcode.com/problems/subarrays-with-k-different-integers/", difficulty: "H" }
    ]
  },
  {
    id: 4,
    name: "Binary Search (Classic)",
    mastery: "New",
    category: "Binary Search",
    boilerplate: "// Classic Binary Search — O(log n)\nint binarySearch(vector<int>& arr, int target) {\n    int lo = 0, hi = (int)arr.size() - 1;\n    while (lo <= hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (arr[mid] == target) return mid;\n        else if (arr[mid] < target) lo = mid + 1;\n        else hi = mid - 1;\n    }\n    return -1;\n}\n\n// Lower-bound: first index where arr[i] >= target\nint lowerBound(vector<int>& arr, int target) {\n    int lo = 0, hi = (int)arr.size();\n    while (lo < hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (arr[mid] < target) lo = mid + 1;\n        else hi = mid;\n    }\n    return lo;\n}",
    intuition: "Each comparison eliminates half the remaining search space. Maintain a clear invariant for what lo and hi represent.",
    whenToUse: "Sorted arrays; first/last occurrence; rotated sorted arrays; peak element. Keywords: 'sorted', 'search target', 'find position'.",
    mistakes: "Using mid=(lo+hi)/2 which overflows; wrong loop condition (< vs <=); off-by-one in boundary variants.",
    questions: [
      { name: "Binary Search", url: "https://leetcode.com/problems/binary-search/", difficulty: "E" },
      { name: "Search in Rotated Sorted Array", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/", difficulty: "M" },
      { name: "Find First and Last Position of Element", url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/", difficulty: "M" },
      { name: "Find Minimum in Rotated Sorted Array", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", difficulty: "M" },
      { name: "Peak Index in a Mountain Array", url: "https://leetcode.com/problems/peak-index-in-a-mountain-array/", difficulty: "M" },
      { name: "Median of Two Sorted Arrays", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/", difficulty: "H" }
    ]
  },
  {
    id: 5,
    name: "Binary Search on Answer",
    mastery: "New",
    category: "Binary Search",
    boilerplate: "// Binary Search on Answer Space — O(n log(range))\n// 1. Define [lo, hi] = answer range\n// 2. Write feasibility check: canAchieve(mid)\n// 3. if feasible: hi=mid; else lo=mid+1\n// 4. Answer is lo\n\nbool canEatAll(vector<int>& piles, int speed, int h) {\n    long long hours = 0;\n    for (int p : piles) hours += (p + speed - 1) / speed;\n    return hours <= h;\n}\n\nint minEatingSpeed(vector<int>& piles, int h) {\n    int lo = 1, hi = *max_element(piles.begin(), piles.end());\n    while (lo < hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (canEatAll(piles, mid, h)) hi = mid;\n        else lo = mid + 1;\n    }\n    return lo;\n}",
    intuition: "When you can check 'is X achievable?' in O(n), binary search on X. The answer space must be monotone: feasible for all values >= answer.",
    whenToUse: "Minimize max / maximize min; allocation with constraints. Keywords: 'minimum speed', 'maximum pages', 'divide into k parts'.",
    mistakes: "Wrong search space bounds; non-monotone feasibility check; overflow in feasibility check.",
    questions: [
      { name: "Koko Eating Bananas", url: "https://leetcode.com/problems/koko-eating-bananas/", difficulty: "M" },
      { name: "Capacity To Ship Packages Within D Days", url: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/", difficulty: "M" },
      { name: "Split Array Largest Sum", url: "https://leetcode.com/problems/split-array-largest-sum/", difficulty: "H" },
      { name: "Minimum Number of Days to Make m Bouquets", url: "https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/", difficulty: "M" },
      { name: "Magnetic Force Between Two Balls", url: "https://leetcode.com/problems/magnetic-force-between-two-balls/", difficulty: "M" },
      { name: "Find the Smallest Divisor Given a Threshold", url: "https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/", difficulty: "M" }
    ]
  },
  {
    id: 6,
    name: "Fast & Slow Pointers",
    mastery: "New",
    category: "Linked Lists",
    boilerplate: "struct ListNode { int val; ListNode* next; };\n\n// Detect cycle — Floyd's algorithm\nbool hasCycle(ListNode* head) {\n    ListNode* slow = head, *fast = head;\n    while (fast && fast->next) {\n        slow = slow->next;\n        fast = fast->next->next;\n        if (slow == fast) return true;\n    }\n    return false;\n}\n\n// Find cycle start\nListNode* detectCycle(ListNode* head) {\n    ListNode* slow = head, *fast = head;\n    while (fast && fast->next) {\n        slow = slow->next;\n        fast = fast->next->next;\n        if (slow == fast) {\n            slow = head;\n            while (slow != fast) { slow = slow->next; fast = fast->next; }\n            return slow;\n        }\n    }\n    return nullptr;\n}\n\n// Find middle\nListNode* middleNode(ListNode* head) {\n    ListNode* slow = head, *fast = head;\n    while (fast && fast->next) { slow = slow->next; fast = fast->next->next; }\n    return slow;\n}",
    intuition: "Fast pointer covers 2x distance. When it reaches end, slow is at midpoint. When they meet in a cycle, resetting slow to head finds cycle entry.",
    whenToUse: "Cycle detection/start; middle of list; palindrome linked list; happy number. Keywords: 'cycle', 'loop', 'middle', 'nth from end'.",
    mistakes: "Checking fast->next before fast (null dereference); wrong middle for even length; forgetting to reset slow when finding cycle start.",
    questions: [
      { name: "Linked List Cycle", url: "https://leetcode.com/problems/linked-list-cycle/", difficulty: "E" },
      { name: "Linked List Cycle II", url: "https://leetcode.com/problems/linked-list-cycle-ii/", difficulty: "M" },
      { name: "Middle of the Linked List", url: "https://leetcode.com/problems/middle-of-the-linked-list/", difficulty: "E" },
      { name: "Happy Number", url: "https://leetcode.com/problems/happy-number/", difficulty: "E" },
      { name: "Palindrome Linked List", url: "https://leetcode.com/problems/palindrome-linked-list/", difficulty: "E" },
      { name: "Find the Duplicate Number", url: "https://leetcode.com/problems/find-the-duplicate-number/", difficulty: "M" }
    ]
  },
  {
    id: 7,
    name: "Merge Intervals",
    mastery: "New",
    category: "Arrays",
    boilerplate: "// Merge overlapping intervals — O(n log n)\nvector<vector<int>> merge(vector<vector<int>>& intervals) {\n    sort(intervals.begin(), intervals.end());\n    vector<vector<int>> merged;\n    for (auto& iv : intervals) {\n        if (merged.empty() || merged.back()[1] < iv[0])\n            merged.push_back(iv);\n        else\n            merged.back()[1] = max(merged.back()[1], iv[1]);\n    }\n    return merged;\n}\n\n// Insert interval into sorted non-overlapping list\nvector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newIv) {\n    vector<vector<int>> res;\n    int i = 0, n = intervals.size();\n    while (i < n && intervals[i][1] < newIv[0]) res.push_back(intervals[i++]);\n    while (i < n && intervals[i][0] <= newIv[1]) {\n        newIv[0] = min(newIv[0], intervals[i][0]);\n        newIv[1] = max(newIv[1], intervals[i][1]);\n        i++;\n    }\n    res.push_back(newIv);\n    while (i < n) res.push_back(intervals[i++]);\n    return res;\n}",
    intuition: "Sort by start time — a linear pass can decide merge-or-new by comparing the new start with the last merged end.",
    whenToUse: "Overlapping intervals, scheduling conflicts, calendar merging. Keywords: 'intervals', 'overlap', 'merge', 'meeting rooms'.",
    mistakes: "Not sorting first; comparing wrong boundaries; not handling adjacent intervals; mutating while iterating.",
    questions: [
      { name: "Merge Intervals", url: "https://leetcode.com/problems/merge-intervals/", difficulty: "M" },
      { name: "Insert Interval", url: "https://leetcode.com/problems/insert-interval/", difficulty: "M" },
      { name: "Meeting Rooms II", url: "https://leetcode.com/problems/meeting-rooms-ii/", difficulty: "M" },
      { name: "Non-overlapping Intervals", url: "https://leetcode.com/problems/non-overlapping-intervals/", difficulty: "M" },
      { name: "Minimum Number of Arrows to Burst Balloons", url: "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/", difficulty: "M" },
      { name: "Employee Free Time", url: "https://leetcode.com/problems/employee-free-time/", difficulty: "H" }
    ]
  },
  {
    id: 8,
    name: "Cyclic Sort",
    mastery: "New",
    category: "Arrays",
    boilerplate: "// Cyclic Sort — O(n) time, O(1) space\n// Works when array has numbers in range [1, n]\nvoid cyclicSort(vector<int>& nums) {\n    int i = 0;\n    while (i < (int)nums.size()) {\n        int j = nums[i] - 1; // correct index for nums[i]\n        if (nums[i] > 0 && nums[i] <= (int)nums.size() && nums[i] != nums[j])\n            swap(nums[i], nums[j]);\n        else\n            i++;\n    }\n}\n\n// Find all missing numbers\nvector<int> findDisappearedNumbers(vector<int>& nums) {\n    cyclicSort(nums);\n    vector<int> missing;\n    for (int i = 0; i < (int)nums.size(); i++)\n        if (nums[i] != i + 1) missing.push_back(i + 1);\n    return missing;\n}",
    intuition: "Each number in [1,n] belongs at index (nums[i]-1). Keep swapping until every number is home, then scan for anomalies.",
    whenToUse: "Array contains numbers in [1,n]; finding missing/duplicate numbers. Keywords: 'missing number', 'duplicate', 'range 1 to n'.",
    mistakes: "Infinite loop with duplicates — must check nums[i] != nums[j] before swapping.",
    questions: [
      { name: "Missing Number", url: "https://leetcode.com/problems/missing-number/", difficulty: "E" },
      { name: "Find the Duplicate Number", url: "https://leetcode.com/problems/find-the-duplicate-number/", difficulty: "M" },
      { name: "Find All Numbers Disappeared in an Array", url: "https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/", difficulty: "E" },
      { name: "Find All Duplicates in an Array", url: "https://leetcode.com/problems/find-all-duplicates-in-an-array/", difficulty: "M" },
      { name: "First Missing Positive", url: "https://leetcode.com/problems/first-missing-positive/", difficulty: "H" }
    ]
  },
  {
    id: 9,
    name: "In-place Linked List Reversal",
    mastery: "New",
    category: "Linked Lists",
    boilerplate: "struct ListNode { int val; ListNode* next; };\n\n// Reverse entire list\nListNode* reverseList(ListNode* head) {\n    ListNode* prev = nullptr, *curr = head;\n    while (curr) {\n        ListNode* nxt = curr->next;\n        curr->next = prev;\n        prev = curr;\n        curr = nxt;\n    }\n    return prev;\n}\n\n// Reverse sublist [left, right] (1-indexed)\nListNode* reverseBetween(ListNode* head, int left, int right) {\n    ListNode dummy(0); dummy.next = head;\n    ListNode* prev = &dummy;\n    for (int i = 1; i < left; i++) prev = prev->next;\n    ListNode* curr = prev->next;\n    for (int i = 0; i < right - left; i++) {\n        ListNode* nxt = curr->next;\n        curr->next = nxt->next;\n        nxt->next = prev->next;\n        prev->next = nxt;\n    }\n    return dummy.next;\n}",
    intuition: "Re-wire next pointers iteratively using prev/curr/next trio. A dummy node avoids special-casing the head.",
    whenToUse: "Reversing whole or partial linked lists; rotating; reorder list. Keywords: 'reverse', 'rotate', 'reorder', 'k-groups'.",
    mistakes: "Losing reference to next before re-wiring; no dummy node; off-by-one in sublist boundaries.",
    questions: [
      { name: "Reverse Linked List", url: "https://leetcode.com/problems/reverse-linked-list/", difficulty: "E" },
      { name: "Reverse Linked List II", url: "https://leetcode.com/problems/reverse-linked-list-ii/", difficulty: "M" },
      { name: "Reverse Nodes in k-Group", url: "https://leetcode.com/problems/reverse-nodes-in-k-group/", difficulty: "H" },
      { name: "Rotate List", url: "https://leetcode.com/problems/rotate-list/", difficulty: "M" },
      { name: "Reorder List", url: "https://leetcode.com/problems/reorder-list/", difficulty: "M" },
      { name: "Swap Nodes in Pairs", url: "https://leetcode.com/problems/swap-nodes-in-pairs/", difficulty: "M" }
    ]
  },
  {
    id: 10,
    name: "Monotonic Stack",
    mastery: "New",
    category: "Arrays",
    boilerplate: "// Next Greater Element — O(n)\nvector<int> nextGreater(vector<int>& nums) {\n    int n = nums.size();\n    vector<int> res(n, -1);\n    stack<int> st; // indices\n    for (int i = 0; i < n; i++) {\n        while (!st.empty() && nums[st.top()] < nums[i]) {\n            res[st.top()] = nums[i];\n            st.pop();\n        }\n        st.push(i);\n    }\n    return res;\n}\n\n// Largest rectangle in histogram\nint largestRectangleArea(vector<int>& h) {\n    stack<int> st;\n    int maxArea = 0;\n    h.push_back(0);\n    for (int i = 0; i < (int)h.size(); i++) {\n        while (!st.empty() && h[st.top()] > h[i]) {\n            int height = h[st.top()]; st.pop();\n            int width  = st.empty() ? i : i - st.top() - 1;\n            maxArea = max(maxArea, height * width);\n        }\n        st.push(i);\n    }\n    return maxArea;\n}",
    intuition: "Maintain elements in monotone order. Pop gives the next-greater/smaller for the popped element in O(1) amortized.",
    whenToUse: "Next/previous greater or smaller; histogram area; buildings with ocean view; stock span. Keywords: 'next greater', 'previous smaller', 'span', 'histogram'.",
    mistakes: "Pushing values instead of indices; wrong monotone direction; not adding sentinel 0 to flush stack.",
    questions: [
      { name: "Daily Temperatures", url: "https://leetcode.com/problems/daily-temperatures/", difficulty: "M" },
      { name: "Next Greater Element I", url: "https://leetcode.com/problems/next-greater-element-i/", difficulty: "E" },
      { name: "Largest Rectangle in Histogram", url: "https://leetcode.com/problems/largest-rectangle-in-histogram/", difficulty: "H" },
      { name: "Maximal Rectangle", url: "https://leetcode.com/problems/maximal-rectangle/", difficulty: "H" },
      { name: "Trapping Rain Water", url: "https://leetcode.com/problems/trapping-rain-water/", difficulty: "H" },
      { name: "Sum of Subarray Minimums", url: "https://leetcode.com/problems/sum-of-subarray-minimums/", difficulty: "M" }
    ]
  },
  {
    id: 11,
    name: "BFS (Level Order)",
    mastery: "New",
    category: "Trees",
    boilerplate: "struct TreeNode { int val; TreeNode* left; TreeNode* right; };\n\n// BFS Level Order — O(n)\nvector<vector<int>> levelOrder(TreeNode* root) {\n    vector<vector<int>> result;\n    if (!root) return result;\n    queue<TreeNode*> q;\n    q.push(root);\n    while (!q.empty()) {\n        int sz = q.size();\n        vector<int> level;\n        for (int i = 0; i < sz; i++) {\n            TreeNode* node = q.front(); q.pop();\n            level.push_back(node->val);\n            if (node->left)  q.push(node->left);\n            if (node->right) q.push(node->right);\n        }\n        result.push_back(level);\n    }\n    return result;\n}\n\n// BFS shortest path in unweighted graph\nint shortestPath(vector<vector<int>>& adj, int src, int dst, int n) {\n    vector<bool> vis(n, false);\n    queue<int> q;\n    q.push(src); vis[src] = true;\n    int dist = 0;\n    while (!q.empty()) {\n        int sz = q.size();\n        for (int i = 0; i < sz; i++) {\n            int node = q.front(); q.pop();\n            if (node == dst) return dist;\n            for (int nb : adj[node])\n                if (!vis[nb]) { vis[nb] = true; q.push(nb); }\n        }\n        dist++;\n    }\n    return -1;\n}",
    intuition: "BFS explores level by level — naturally gives shortest paths in unweighted graphs and enables per-level processing in trees.",
    whenToUse: "Level-order tree problems; shortest path in unweighted graph/grid; minimum steps. Keywords: 'level', 'shortest path', 'minimum steps', 'word ladder'.",
    mistakes: "Not marking visited before pushing (duplicates); not snapshotting queue size (level blending); using DFS when shortest path is needed.",
    questions: [
      { name: "Binary Tree Level Order Traversal", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/", difficulty: "M" },
      { name: "Word Ladder", url: "https://leetcode.com/problems/word-ladder/", difficulty: "H" },
      { name: "Rotting Oranges", url: "https://leetcode.com/problems/rotting-oranges/", difficulty: "M" },
      { name: "01 Matrix", url: "https://leetcode.com/problems/01-matrix/", difficulty: "M" },
      { name: "Binary Tree Right Side View", url: "https://leetcode.com/problems/binary-tree-right-side-view/", difficulty: "M" },
      { name: "Minimum Depth of Binary Tree", url: "https://leetcode.com/problems/minimum-depth-of-binary-tree/", difficulty: "E" }
    ]
  },
  {
    id: 12,
    name: "DFS (Tree)",
    mastery: "New",
    category: "Trees",
    boilerplate: "struct TreeNode { int val; TreeNode* left; TreeNode* right; };\n\n// Post-order DFS\nint maxDepth(TreeNode* root) {\n    if (!root) return 0;\n    return 1 + max(maxDepth(root->left), maxDepth(root->right));\n}\n\n// Global answer pattern (diameter)\nint ans = 0;\nint dfs(TreeNode* node) {\n    if (!node) return 0;\n    int L = dfs(node->left), R = dfs(node->right);\n    ans = max(ans, L + R);\n    return 1 + max(L, R);\n}\n\n// Validate BST with bounds\nbool isValidBST(TreeNode* root, long mn = LONG_MIN, long mx = LONG_MAX) {\n    if (!root) return true;\n    if (root->val <= mn || root->val >= mx) return false;\n    return isValidBST(root->left, mn, root->val) &&\n           isValidBST(root->right, root->val, mx);\n}",
    intuition: "Post-order: children computed before parent (height, diameter). Pre-order: parent passes context down (path sum, bounds).",
    whenToUse: "Tree height/depth; path sums; LCA; diameter; BST validation. Keywords: 'path', 'depth', 'height', 'ancestor', 'subtree'.",
    mistakes: "Missing null base case; global variable not reset between tests; height vs depth confusion.",
    questions: [
      { name: "Maximum Depth of Binary Tree", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", difficulty: "E" },
      { name: "Diameter of Binary Tree", url: "https://leetcode.com/problems/diameter-of-binary-tree/", difficulty: "E" },
      { name: "Binary Tree Maximum Path Sum", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/", difficulty: "H" },
      { name: "Lowest Common Ancestor of a Binary Tree", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/", difficulty: "M" },
      { name: "Path Sum II", url: "https://leetcode.com/problems/path-sum-ii/", difficulty: "M" },
      { name: "Serialize and Deserialize Binary Tree", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/", difficulty: "H" }
    ]
  },
  {
    id: 13,
    name: "DFS (Graph / Backtracking)",
    mastery: "New",
    category: "Graphs",
    boilerplate: "// DFS on graph\nvoid dfs(int node, vector<vector<int>>& adj, vector<bool>& vis) {\n    vis[node] = true;\n    for (int nb : adj[node])\n        if (!vis[nb]) dfs(nb, adj, vis);\n}\n\n// Count connected components\nint countComponents(int n, vector<vector<int>>& edges) {\n    vector<vector<int>> adj(n);\n    for (auto& e : edges) { adj[e[0]].push_back(e[1]); adj[e[1]].push_back(e[0]); }\n    vector<bool> vis(n, false);\n    int cnt = 0;\n    for (int i = 0; i < n; i++) if (!vis[i]) { dfs(i, adj, vis); cnt++; }\n    return cnt;\n}\n\n// Backtracking template\nvoid backtrack(vector<int>& path, vector<bool>& used, vector<int>& nums,\n               vector<vector<int>>& res) {\n    if ((int)path.size() == (int)nums.size()) { res.push_back(path); return; }\n    for (int i = 0; i < (int)nums.size(); i++) {\n        if (used[i]) continue;\n        used[i] = true; path.push_back(nums[i]);\n        backtrack(path, used, nums, res);\n        used[i] = false; path.pop_back(); // RESTORE STATE\n    }\n}",
    intuition: "DFS explores deep before backtracking. Always restore state after recursion so each branch sees a clean slate.",
    whenToUse: "Graph traversal; cycle detection; islands; all permutations/combinations; constraint satisfaction. Keywords: 'all paths', 'connected', 'islands', 'permutations'.",
    mistakes: "Forgetting pop_back/undo; not marking visited before recursive call; visited array not cleared between paths.",
    questions: [
      { name: "Number of Islands", url: "https://leetcode.com/problems/number-of-islands/", difficulty: "M" },
      { name: "All Paths From Source to Target", url: "https://leetcode.com/problems/all-paths-from-source-to-target/", difficulty: "M" },
      { name: "Permutations", url: "https://leetcode.com/problems/permutations/", difficulty: "M" },
      { name: "N-Queens", url: "https://leetcode.com/problems/n-queens/", difficulty: "H" },
      { name: "Word Search", url: "https://leetcode.com/problems/word-search/", difficulty: "M" },
      { name: "Pacific Atlantic Water Flow", url: "https://leetcode.com/problems/pacific-atlantic-water-flow/", difficulty: "M" }
    ]
  },
  {
    id: 14,
    name: "Union-Find (DSU)",
    mastery: "New",
    category: "Graphs",
    boilerplate: "class DSU {\n    vector<int> parent, rank_;\npublic:\n    DSU(int n) : parent(n), rank_(n, 0) {\n        iota(parent.begin(), parent.end(), 0);\n    }\n    int find(int x) {\n        if (parent[x] != x) parent[x] = find(parent[x]); // path compression\n        return parent[x];\n    }\n    bool unite(int x, int y) {\n        int px = find(x), py = find(y);\n        if (px == py) return false;\n        if (rank_[px] < rank_[py]) swap(px, py);\n        parent[py] = px;\n        if (rank_[px] == rank_[py]) rank_[px]++;\n        return true;\n    }\n    bool connected(int x, int y) { return find(x) == find(y); }\n};\n\n// Detect cycle\nbool hasCycle(int n, vector<vector<int>>& edges) {\n    DSU dsu(n);\n    for (auto& e : edges)\n        if (!dsu.unite(e[0], e[1])) return true;\n    return false;\n}",
    intuition: "DSU groups elements into disjoint sets. Path compression + union by rank gives near O(1) amortized (inverse Ackermann).",
    whenToUse: "Dynamic connectivity; cycle detection; Kruskal's MST; accounts merge. Keywords: 'connected components', 'union', 'group', 'merge'.",
    mistakes: "No path compression (O(n) find); no union by rank (degrades to chain); out-of-range element.",
    questions: [
      { name: "Number of Connected Components in an Undirected Graph", url: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/", difficulty: "M" },
      { name: "Redundant Connection", url: "https://leetcode.com/problems/redundant-connection/", difficulty: "M" },
      { name: "Accounts Merge", url: "https://leetcode.com/problems/accounts-merge/", difficulty: "M" },
      { name: "Graph Valid Tree", url: "https://leetcode.com/problems/graph-valid-tree/", difficulty: "M" },
      { name: "Number of Provinces", url: "https://leetcode.com/problems/number-of-provinces/", difficulty: "M" },
      { name: "Min Cost to Connect All Points", url: "https://leetcode.com/problems/min-cost-to-connect-all-points/", difficulty: "M" }
    ]
  },
  {
    id: 15,
    name: "Topological Sort (Kahn's BFS)",
    mastery: "New",
    category: "Graphs",
    boilerplate: "// Kahn's Algorithm — O(V + E)\nvector<int> topoSort(int n, vector<vector<int>>& edges) {\n    vector<vector<int>> adj(n);\n    vector<int> indegree(n, 0);\n    for (auto& e : edges) { adj[e[0]].push_back(e[1]); indegree[e[1]]++; }\n    queue<int> q;\n    for (int i = 0; i < n; i++) if (indegree[i] == 0) q.push(i);\n    vector<int> order;\n    while (!q.empty()) {\n        int node = q.front(); q.pop();\n        order.push_back(node);\n        for (int nb : adj[node])\n            if (--indegree[nb] == 0) q.push(nb);\n    }\n    return (int)order.size() == n ? order : vector<int>{}; // empty = cycle\n}\n\nbool canFinish(int n, vector<vector<int>>& prereqs) {\n    return topoSort(n, prereqs).size() == (size_t)n;\n}",
    intuition: "Process nodes with no remaining dependencies first. Reduce neighbors' in-degree each time. If all nodes processed, no cycle.",
    whenToUse: "Dependency ordering; course scheduling; build systems; alien dictionary. Keywords: 'prerequisites', 'dependencies', 'before', 'schedule'.",
    mistakes: "Wrong edge direction; not detecting cycles (size < n); not seeding all zero-indegree nodes.",
    questions: [
      { name: "Course Schedule", url: "https://leetcode.com/problems/course-schedule/", difficulty: "M" },
      { name: "Course Schedule II", url: "https://leetcode.com/problems/course-schedule-ii/", difficulty: "M" },
      { name: "Alien Dictionary", url: "https://leetcode.com/problems/alien-dictionary/", difficulty: "H" },
      { name: "Minimum Height Trees", url: "https://leetcode.com/problems/minimum-height-trees/", difficulty: "M" },
      { name: "Sequence Reconstruction", url: "https://leetcode.com/problems/sequence-reconstruction/", difficulty: "M" },
      { name: "Find All Possible Recipes from Given Supplies", url: "https://leetcode.com/problems/find-all-possible-recipes-from-given-supplies/", difficulty: "M" }
    ]
  },
  {
    id: 16,
    name: "Trie",
    mastery: "New",
    category: "Strings",
    boilerplate: "struct TrieNode {\n    TrieNode* ch[26] = {};\n    bool isEnd = false;\n};\n\nclass Trie {\n    TrieNode* root;\npublic:\n    Trie() : root(new TrieNode()) {}\n\n    void insert(const string& w) {\n        TrieNode* node = root;\n        for (char c : w) {\n            int i = c - 'a';\n            if (!node->ch[i]) node->ch[i] = new TrieNode();\n            node = node->ch[i];\n        }\n        node->isEnd = true;\n    }\n\n    bool search(const string& w) {\n        TrieNode* node = root;\n        for (char c : w) {\n            int i = c - 'a';\n            if (!node->ch[i]) return false;\n            node = node->ch[i];\n        }\n        return node->isEnd;\n    }\n\n    bool startsWith(const string& prefix) {\n        TrieNode* node = root;\n        for (char c : prefix) {\n            int i = c - 'a';\n            if (!node->ch[i]) return false;\n            node = node->ch[i];\n        }\n        return true;\n    }\n};",
    intuition: "Shared prefixes share nodes. O(L) lookup regardless of dictionary size — far better than hashing for prefix queries.",
    whenToUse: "Autocomplete; prefix matching; word search in board (with DFS). Keywords: 'prefix', 'autocomplete', 'dictionary', 'word search'.",
    mistakes: "Forgetting isEnd = true; checking children before moving pointer; using map instead of array[26] for non-lowercase inputs.",
    questions: [
      { name: "Implement Trie (Prefix Tree)", url: "https://leetcode.com/problems/implement-trie-prefix-tree/", difficulty: "M" },
      { name: "Word Search II", url: "https://leetcode.com/problems/word-search-ii/", difficulty: "H" },
      { name: "Design Add and Search Words Data Structure", url: "https://leetcode.com/problems/design-add-and-search-words-data-structure/", difficulty: "M" },
      { name: "Replace Words", url: "https://leetcode.com/problems/replace-words/", difficulty: "M" },
      { name: "Maximum XOR of Two Numbers in an Array", url: "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/", difficulty: "M" },
      { name: "Longest Word in Dictionary", url: "https://leetcode.com/problems/longest-word-in-dictionary/", difficulty: "M" }
    ]
  },
  {
    id: 17,
    name: "Top K Elements (Heap)",
    mastery: "New",
    category: "Arrays",
    boilerplate: "// Min-Heap of size K = top K largest — O(n log k)\nvector<int> topKLargest(vector<int>& nums, int k) {\n    priority_queue<int, vector<int>, greater<int>> minH;\n    for (int num : nums) {\n        minH.push(num);\n        if ((int)minH.size() > k) minH.pop();\n    }\n    vector<int> res;\n    while (!minH.empty()) { res.push_back(minH.top()); minH.pop(); }\n    return res;\n}\n\n// Top K frequent elements\nvector<int> topKFrequent(vector<int>& nums, int k) {\n    unordered_map<int,int> freq;\n    for (int n : nums) freq[n]++;\n    using P = pair<int,int>;\n    priority_queue<P, vector<P>, greater<P>> minH;\n    for (auto& [val, cnt] : freq) {\n        minH.push({cnt, val});\n        if ((int)minH.size() > k) minH.pop();\n    }\n    vector<int> res;\n    while (!minH.empty()) { res.push_back(minH.top().second); minH.pop(); }\n    return res;\n}",
    intuition: "A min-heap of size K stores the K largest seen so far. New element beats smallest? Pop smallest, push new.",
    whenToUse: "Top K largest/smallest/frequent; K closest points. Keywords: 'top k', 'kth largest', 'k closest', 'k most frequent'.",
    mistakes: "Max-heap for top-K-largest (O(n log n) instead of O(n log k)); forgetting to negate for custom comparators.",
    questions: [
      { name: "Kth Largest Element in an Array", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/", difficulty: "M" },
      { name: "Top K Frequent Elements", url: "https://leetcode.com/problems/top-k-frequent-elements/", difficulty: "M" },
      { name: "K Closest Points to Origin", url: "https://leetcode.com/problems/k-closest-points-to-origin/", difficulty: "M" },
      { name: "Sort Characters By Frequency", url: "https://leetcode.com/problems/sort-characters-by-frequency/", difficulty: "M" },
      { name: "Kth Largest Element in a Stream", url: "https://leetcode.com/problems/kth-largest-element-in-a-stream/", difficulty: "E" },
      { name: "Find K Pairs with Smallest Sums", url: "https://leetcode.com/problems/find-k-pairs-with-smallest-sums/", difficulty: "M" }
    ]
  },
  {
    id: 18,
    name: "Two Heaps",
    mastery: "New",
    category: "Arrays",
    boilerplate: "// Two Heaps — Running Median\n// maxHeap = smaller half, minHeap = larger half\nclass MedianFinder {\n    priority_queue<int> maxH;                          // max-heap\n    priority_queue<int,vector<int>,greater<int>> minH; // min-heap\npublic:\n    void addNum(int num) {\n        maxH.push(num);\n        if (!minH.empty() && maxH.top() > minH.top()) {\n            minH.push(maxH.top()); maxH.pop();\n        }\n        if ((int)maxH.size() > (int)minH.size() + 1) {\n            minH.push(maxH.top()); maxH.pop();\n        } else if ((int)minH.size() > (int)maxH.size()) {\n            maxH.push(minH.top()); minH.pop();\n        }\n    }\n    double findMedian() {\n        if (maxH.size() == minH.size())\n            return (maxH.top() + minH.top()) / 2.0;\n        return maxH.top();\n    }\n};",
    intuition: "Partition stream into lower/upper halves. The median lives at the boundary of a max-heap (lower) and min-heap (upper).",
    whenToUse: "Running median; sliding window median. Keywords: 'median', 'running median', 'sliding window median'.",
    mistakes: "Not rebalancing after insertion; not checking cross-heap ordering; integer overflow when averaging.",
    questions: [
      { name: "Find Median from Data Stream", url: "https://leetcode.com/problems/find-median-from-data-stream/", difficulty: "H" },
      { name: "Sliding Window Median", url: "https://leetcode.com/problems/sliding-window-median/", difficulty: "H" },
      { name: "IPO", url: "https://leetcode.com/problems/ipo/", difficulty: "H" },
      { name: "Task Scheduler", url: "https://leetcode.com/problems/task-scheduler/", difficulty: "M" },
      { name: "Rearrange String k Distance Apart", url: "https://leetcode.com/problems/rearrange-string-k-distance-apart/", difficulty: "H" }
    ]
  },
  {
    id: 19,
    name: "K-way Merge",
    mastery: "New",
    category: "Arrays",
    boilerplate: "// K-way Merge — O(n log k)\nvector<int> mergeKSorted(vector<vector<int>>& arrays) {\n    using T = tuple<int,int,int>; // {val, arr_idx, elem_idx}\n    priority_queue<T, vector<T>, greater<T>> minH;\n    for (int i = 0; i < (int)arrays.size(); i++)\n        if (!arrays[i].empty()) minH.push({arrays[i][0], i, 0});\n    vector<int> res;\n    while (!minH.empty()) {\n        auto [val, ai, ei] = minH.top(); minH.pop();\n        res.push_back(val);\n        if (ei + 1 < (int)arrays[ai].size())\n            minH.push({arrays[ai][ei+1], ai, ei+1});\n    }\n    return res;\n}\n\n// Merge k sorted linked lists\nstruct ListNode { int val; ListNode* next; };\nListNode* mergeKLists(vector<ListNode*>& lists) {\n    using P = pair<int,ListNode*>;\n    priority_queue<P, vector<P>, greater<P>> minH;\n    for (auto* l : lists) if (l) minH.push({l->val, l});\n    ListNode dummy(0); ListNode* tail = &dummy;\n    while (!minH.empty()) {\n        auto [v, node] = minH.top(); minH.pop();\n        tail->next = node; tail = tail->next;\n        if (node->next) minH.push({node->next->val, node->next});\n    }\n    return dummy.next;\n}",
    intuition: "Always pick the globally smallest current element from k sources. A min-heap of size k makes each pick O(log k).",
    whenToUse: "Merging k sorted lists/arrays; smallest range; Kth smallest in matrix. Keywords: 'merge k sorted', 'k lists', 'smallest range'.",
    mistakes: "Initializing heap with all elements (defeats purpose); not storing source index; not checking bounds before pushing next.",
    questions: [
      { name: "Merge k Sorted Lists", url: "https://leetcode.com/problems/merge-k-sorted-lists/", difficulty: "H" },
      { name: "Kth Smallest Element in a Sorted Matrix", url: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/", difficulty: "M" },
      { name: "Smallest Range Covering Elements from K Lists", url: "https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/", difficulty: "H" },
      { name: "Find K Pairs with Smallest Sums", url: "https://leetcode.com/problems/find-k-pairs-with-smallest-sums/", difficulty: "M" },
      { name: "Ugly Number II", url: "https://leetcode.com/problems/ugly-number-ii/", difficulty: "M" }
    ]
  },
  {
    id: 20,
    name: "Subsets / Backtracking",
    mastery: "New",
    category: "Arrays",
    boilerplate: "// All subsets — O(2^n * n)\nvector<vector<int>> subsets(vector<int>& nums) {\n    vector<vector<int>> res;\n    vector<int> path;\n    function<void(int)> bt = [&](int start) {\n        res.push_back(path);\n        for (int i = start; i < (int)nums.size(); i++) {\n            path.push_back(nums[i]);\n            bt(i + 1);\n            path.pop_back();\n        }\n    };\n    bt(0);\n    return res;\n}\n\n// Combination Sum (elements reusable)\nvoid combinationSum(vector<int>& cands, int target, int start,\n                    vector<int>& path, vector<vector<int>>& res) {\n    if (target == 0) { res.push_back(path); return; }\n    for (int i = start; i < (int)cands.size(); i++) {\n        if (cands[i] > target) break; // prune — sort first!\n        path.push_back(cands[i]);\n        combinationSum(cands, target - cands[i], i, path, res); // i, not i+1\n        path.pop_back();\n    }\n}",
    intuition: "Decision tree: at each element, include or exclude. Backtracking prunes branches that can't reach a valid answer.",
    whenToUse: "All subsets/combinations/permutations; combinatorial search. Keywords: 'all subsets', 'combinations', 'power set', 'k elements'.",
    mistakes: "Missing pop_back; iterating from 0 instead of start (duplicate subsets); not sorting before skipping duplicates in Subsets II; reuse allowed = pass i, no reuse = pass i+1.",
    questions: [
      { name: "Subsets", url: "https://leetcode.com/problems/subsets/", difficulty: "M" },
      { name: "Subsets II", url: "https://leetcode.com/problems/subsets-ii/", difficulty: "M" },
      { name: "Combination Sum", url: "https://leetcode.com/problems/combination-sum/", difficulty: "M" },
      { name: "Combination Sum II", url: "https://leetcode.com/problems/combination-sum-ii/", difficulty: "M" },
      { name: "Permutations", url: "https://leetcode.com/problems/permutations/", difficulty: "M" },
      { name: "Letter Combinations of a Phone Number", url: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/", difficulty: "M" }
    ]
  },
  {
    id: 21,
    name: "DP - 0/1 Knapsack",
    mastery: "New",
    category: "DP",
    boilerplate: "// 0/1 Knapsack — each item at most once\n// O(n*W) time, O(W) space with 1D rolling\nint knapsack01(vector<int>& wt, vector<int>& val, int W) {\n    vector<int> dp(W + 1, 0);\n    for (int i = 0; i < (int)wt.size(); i++)\n        for (int w = W; w >= wt[i]; w--) // REVERSE to avoid reuse\n            dp[w] = max(dp[w], dp[w - wt[i]] + val[i]);\n    return dp[W];\n}\n\n// Subset Sum: can we hit exactly target?\nbool subsetSum(vector<int>& nums, int target) {\n    vector<bool> dp(target + 1, false);\n    dp[0] = true;\n    for (int num : nums)\n        for (int j = target; j >= num; j--)\n            dp[j] = dp[j] || dp[j - num];\n    return dp[target];\n}",
    intuition: "Every item is either taken or not. Reversing the inner loop prevents using the same item twice (distinguishes from unbounded knapsack).",
    whenToUse: "Capacity budget, each item used once; partition equal subset; target sum. Keywords: 'capacity', 'weight', 'at most', 'exactly', 'partition'.",
    mistakes: "Forward inner loop (allows reuse); wrong initialization; base case dp[0] not set.",
    questions: [
      { name: "Partition Equal Subset Sum", url: "https://leetcode.com/problems/partition-equal-subset-sum/", difficulty: "M" },
      { name: "Target Sum", url: "https://leetcode.com/problems/target-sum/", difficulty: "M" },
      { name: "Last Stone Weight II", url: "https://leetcode.com/problems/last-stone-weight-ii/", difficulty: "M" },
      { name: "Ones and Zeroes", url: "https://leetcode.com/problems/ones-and-zeroes/", difficulty: "M" },
      { name: "Profitable Schemes", url: "https://leetcode.com/problems/profitable-schemes/", difficulty: "H" },
      { name: "Count of Subset Sum", url: "https://leetcode.com/problems/target-sum/", difficulty: "M" }
    ]
  },
  {
    id: 22,
    name: "DP - Unbounded Knapsack",
    mastery: "New",
    category: "DP",
    boilerplate: "// Unbounded Knapsack — each item unlimited times\n// FORWARD inner loop enables reuse\nint coinChange(vector<int>& coins, int amount) {\n    vector<int> dp(amount + 1, INT_MAX);\n    dp[0] = 0;\n    for (int i = 1; i <= amount; i++)\n        for (int coin : coins)\n            if (coin <= i && dp[i - coin] != INT_MAX)\n                dp[i] = min(dp[i], dp[i - coin] + 1);\n    return dp[amount] == INT_MAX ? -1 : dp[amount];\n}\n\n// Count ways (Coin Change II)\nint change(int amount, vector<int>& coins) {\n    vector<long long> dp(amount + 1, 0);\n    dp[0] = 1;\n    for (int coin : coins)            // outer: items\n        for (int j = coin; j <= amount; j++) // inner: FORWARD\n            dp[j] += dp[j - coin];\n    return (int)dp[amount];\n}",
    intuition: "Forward inner loop: dp[w - coin] already reflects current coin being used, enabling unlimited reuse.",
    whenToUse: "Unlimited copies per denomination; minimum coins; number of ways to make change. Keywords: 'unlimited', 'any number of times', 'coins', 'denominations'.",
    mistakes: "Reversing inner loop (turns into 0/1); wrong dp[0] init; overflow when adding large counts.",
    questions: [
      { name: "Coin Change", url: "https://leetcode.com/problems/coin-change/", difficulty: "M" },
      { name: "Coin Change II", url: "https://leetcode.com/problems/coin-change-ii/", difficulty: "M" },
      { name: "Perfect Squares", url: "https://leetcode.com/problems/perfect-squares/", difficulty: "M" },
      { name: "Integer Break", url: "https://leetcode.com/problems/integer-break/", difficulty: "M" },
      { name: "Combination Sum IV", url: "https://leetcode.com/problems/combination-sum-iv/", difficulty: "M" },
      { name: "Minimum Cost For Tickets", url: "https://leetcode.com/problems/minimum-cost-for-tickets/", difficulty: "M" }
    ]
  },
  {
    id: 23,
    name: "DP - LCS / LIS",
    mastery: "New",
    category: "DP",
    boilerplate: "// Longest Common Subsequence — O(m*n)\nint longestCommonSubsequence(string t1, string t2) {\n    int m = t1.size(), n = t2.size();\n    vector<vector<int>> dp(m+1, vector<int>(n+1, 0));\n    for (int i = 1; i <= m; i++)\n        for (int j = 1; j <= n; j++)\n            dp[i][j] = t1[i-1]==t2[j-1] ? dp[i-1][j-1]+1\n                                         : max(dp[i-1][j], dp[i][j-1]);\n    return dp[m][n];\n}\n\n// Longest Increasing Subsequence — O(n log n) patience sort\nint lengthOfLIS(vector<int>& nums) {\n    vector<int> tails; // tails[i] = smallest tail of IS of length i+1\n    for (int num : nums) {\n        auto it = lower_bound(tails.begin(), tails.end(), num);\n        if (it == tails.end()) tails.push_back(num);\n        else *it = num;\n    }\n    return (int)tails.size();\n}",
    intuition: "LCS: match from ends of both strings. LIS: maintain smallest possible tail for each IS length via binary search.",
    whenToUse: "LCS: align sequences; edit distance; shortest common supersequence. LIS: envelope nesting; patience sorting. Keywords: 'common subsequence', 'increasing subsequence', 'edit distance'.",
    mistakes: "LCS off-by-one; O(n^2) LIS when n is large; confusing subsequence with subarray.",
    questions: [
      { name: "Longest Common Subsequence", url: "https://leetcode.com/problems/longest-common-subsequence/", difficulty: "M" },
      { name: "Longest Increasing Subsequence", url: "https://leetcode.com/problems/longest-increasing-subsequence/", difficulty: "M" },
      { name: "Edit Distance", url: "https://leetcode.com/problems/edit-distance/", difficulty: "M" },
      { name: "Russian Doll Envelopes", url: "https://leetcode.com/problems/russian-doll-envelopes/", difficulty: "H" },
      { name: "Delete Operation for Two Strings", url: "https://leetcode.com/problems/delete-operation-for-two-strings/", difficulty: "M" },
      { name: "Shortest Common Supersequence", url: "https://leetcode.com/problems/shortest-common-supersequence/", difficulty: "H" }
    ]
  },
  {
    id: 24,
    name: "DP - Interval / Matrix Chain",
    mastery: "New",
    category: "DP",
    boilerplate: "// Interval DP — O(n^3)\n// dp[i][j] = answer for subproblem [i..j]\n// Key: iterate by increasing length, choose 'last pivot k'\n\n// Burst Balloons\nint maxCoins(vector<int>& nums) {\n    nums.insert(nums.begin(), 1); nums.push_back(1);\n    int n = nums.size();\n    vector<vector<int>> dp(n, vector<int>(n, 0));\n    for (int len = 2; len < n; len++) {\n        for (int i = 0; i + len < n; i++) {\n            int j = i + len;\n            for (int k = i+1; k < j; k++) // k = last balloon burst in (i,j)\n                dp[i][j] = max(dp[i][j],\n                    dp[i][k] + nums[i]*nums[k]*nums[j] + dp[k][j]);\n        }\n    }\n    return dp[0][n-1];\n}",
    intuition: "Split interval [i,j] at every 'last' pivot k. Best answer = solve left + solve right + cost at k. Must build up from small intervals to large.",
    whenToUse: "Burst balloons; stone merge; matrix chain; palindrome partition; strange printer. Keywords: 'burst', 'merge', 'split optimally', 'palindrome partition'.",
    mistakes: "Not iterating by length first; wrong k bounds (k must be strictly inside [i,j]); wrong 'last' vs 'first' semantics.",
    questions: [
      { name: "Burst Balloons", url: "https://leetcode.com/problems/burst-balloons/", difficulty: "H" },
      { name: "Minimum Cost to Merge Stones", url: "https://leetcode.com/problems/minimum-cost-to-merge-stones/", difficulty: "H" },
      { name: "Palindrome Partitioning II", url: "https://leetcode.com/problems/palindrome-partitioning-ii/", difficulty: "H" },
      { name: "Strange Printer", url: "https://leetcode.com/problems/strange-printer/", difficulty: "H" },
      { name: "Longest Palindromic Subsequence", url: "https://leetcode.com/problems/longest-palindromic-subsequence/", difficulty: "M" },
      { name: "Zuma Game", url: "https://leetcode.com/problems/zuma-game/", difficulty: "H" }
    ]
  },
  {
    id: 25,
    name: "Bit Manipulation",
    mastery: "New",
    category: "Math",
    boilerplate: "// Bit Manipulation Toolkit\nbool isBitSet(int n, int i)  { return (n >> i) & 1; }\nint setBit(int n, int i)     { return n | (1 << i); }\nint clearBit(int n, int i)   { return n & ~(1 << i); }\nint toggleBit(int n, int i)  { return n ^ (1 << i); }\nbool isPow2(int n)           { return n > 0 && (n & (n-1)) == 0; }\n\n// Count set bits (Brian Kernighan)\nint popcount(int n) {\n    int cnt = 0;\n    while (n) { n &= (n - 1); cnt++; }\n    return cnt;\n}\n\n// Single number (XOR trick: a^a=0, a^0=a)\nint singleNumber(vector<int>& nums) {\n    int res = 0;\n    for (int n : nums) res ^= n;\n    return res;\n}\n\n// Two non-repeating numbers\npair<int,int> singleNumberIII(vector<int>& nums) {\n    int xorAll = 0;\n    for (int n : nums) xorAll ^= n;\n    int diffBit = xorAll & (-xorAll); // isolate rightmost set bit\n    int a = 0, b = 0;\n    for (int n : nums)\n        (n & diffBit ? a : b) ^= n;\n    return {a, b};\n}",
    intuition: "XOR cancels pairs. AND isolates bits. n & (n-1) clears the lowest set bit. These primitives solve many 'find the odd-one-out' and 'subset enumeration' problems in O(1) extra space.",
    whenToUse: "Unique elements; power of 2 checks; bitmask DP; counting bits; in-place swap. Keywords: 'single number', 'subset bitmask', 'XOR', 'power of 2'.",
    mistakes: "Overflow: use 1LL << i for i >= 31; operator precedence: (n >> i) & 1 not n >> (i & 1); confusing & with &&.",
    questions: [
      { name: "Single Number", url: "https://leetcode.com/problems/single-number/", difficulty: "E" },
      { name: "Single Number III", url: "https://leetcode.com/problems/single-number-iii/", difficulty: "M" },
      { name: "Number of 1 Bits", url: "https://leetcode.com/problems/number-of-1-bits/", difficulty: "E" },
      { name: "Counting Bits", url: "https://leetcode.com/problems/counting-bits/", difficulty: "E" },
      { name: "Missing Number", url: "https://leetcode.com/problems/missing-number/", difficulty: "E" },
      { name: "Subsets (Bitmask)", url: "https://leetcode.com/problems/subsets/", difficulty: "M" },
      { name: "Maximum XOR of Two Numbers in an Array", url: "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/", difficulty: "M" }
    ]
  }
];

let patternData = {};

window.renderPatterns = async function() {
  const host = document.getElementById('patternHost');
  if(!host) return;
  
  // Load local pattern data
  const stored = await storeGet('pd_patterns_v1');
  patternData = stored || {};
  let updated = false;
  // Populate missing fields like category from CORE_PATTERNS
  CORE_PATTERNS.forEach(p => {
    if (!patternData[p.name]) {
      patternData[p.name] = { mastery: 'New', boilerplate: p.boilerplate, intuition: p.intuition, whenToUse: p.whenToUse, mistakes: p.mistakes, questions: p.questions || [] };
      updated = true;
    }
    // ensure category is stored
    if (!patternData[p.name].category) {
      patternData[p.name].category = p.category;
      updated = true;
    }
  });
  if (updated) await storeSet('pd_patterns_v1', patternData);

  // View toggle logic
  const viewMode = (document.querySelector('#patternViewToggle .active') || {}).dataset?.v || 'gallery';
  
  const catColors = {
    'Arrays': '#3b82f6', 'Binary Search': '#f59e0b', 'Linked Lists': '#ec4899',
    'Trees': '#10b981', 'Graphs': '#14b8a6', 'Strings': '#8b5cf6', 'DP': '#f43f5e', 'Math': '#6366f1'
  };
  const masteryColors = {
    'New': '#71717a', 'Learning': '#f59e0b', 'Practiced': '#38bdf8', 'Mastered': '#10b981'
  };

  const QUOTES = [
    "\"Talk is cheap. Show me the code.\" — Linus Torvalds",
    "\"First, solve the problem. Then, write the code.\" — John Johnson",
    "\"Patterns are the cheat codes to algorithmic interviews.\" — JARVIS",
    "\"Master the foundation, and the complex becomes simple.\""
  ];
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  let html = `
    <style>
      .pat-cat-badge { font-family:var(--font-mono); font-size:10px; font-weight:700; padding:2px 8px; border-radius:4px; text-transform:uppercase; letter-spacing:0.5px; }
      .pat-mast-badge { font-family:var(--font-mono); font-size:10px; font-weight:600; padding:2px 8px; border-radius:4px; border:1px solid rgba(255,255,255,0.1); }
      .pattern-gallery-new { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:20px; margin-top:20px; }
      .pat-card-new { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:20px; cursor:pointer; transition:all 0.2s; position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; min-height:180px; }
      .pat-card-new:hover { border-color:rgba(255,255,255,0.15); transform:translateY(-3px); box-shadow:0 10px 30px -10px rgba(0,0,0,0.5); }
      .pat-card-new h4 { font-family:var(--font-display); font-size:16px; font-weight:700; color:var(--ink); margin:12px 0 8px; line-height:1.3; }
      .pat-card-new p { font-size:13px; color:var(--ink-soft); line-height:1.6; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; flex:1; }
      
      .pattern-table-wrap { overflow-x:auto; margin-top:20px; border:1px solid rgba(255,255,255,0.06); border-radius:12px; background:rgba(0,0,0,0.2); }
      .pattern-table { width:100%; border-collapse:collapse; text-align:left; }
      .pattern-table th { padding:14px 16px; font-family:var(--font-mono); font-size:11px; font-weight:600; color:var(--ink-faint); text-transform:uppercase; letter-spacing:0.5px; border-bottom:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.02); }
      .pattern-table td { padding:14px 16px; border-bottom:1px solid rgba(255,255,255,0.03); font-size:14px; vertical-align:middle; cursor:pointer; transition:background 0.15s; }
      .pattern-table tr:hover td { background:rgba(255,255,255,0.03); }
      .pattern-table tr:last-child td { border-bottom:none; }
      .pt-title { font-family:var(--font-display); font-weight:600; color:var(--ink); }
      .pt-qs { font-family:var(--font-mono); font-size:12px; color:var(--ink-soft); }
    </style>
    
    <div style="padding:16px 20px; background:linear-gradient(to right, rgba(56,189,248,0.05), transparent); border-radius:12px; border-left:3px solid var(--accent); margin-bottom:10px;">
      <div style="font-style:italic; color:var(--ink-soft); font-size:14px;">${randomQuote}</div>
    </div>
  `;

  // Sort patterns primarily by Category, then by Name
  const sortedNames = Object.keys(patternData).sort((a,b) => {
    const ca = patternData[a].category || '';
    const cb = patternData[b].category || '';
    if (ca !== cb) return ca.localeCompare(cb);
    return a.localeCompare(b);
  });
  
  if (viewMode === 'gallery') {
    html += `<div class="pattern-gallery-new">`;
    sortedNames.forEach(name => {
      const p = patternData[name];
      const catColor = catColors[p.category] || '#71717a';
      const mColor = masteryColors[p.mastery] || '#71717a';
      
      html += `<div class="pat-card-new" data-pattern-name="${esc(name)}">
        <div style="position:absolute; top:0; left:0; width:100%; height:3px; background:${catColor}; opacity:0.7;"></div>
        <div>
          <span class="pat-cat-badge" style="color:${catColor}; background:${catColor}15;">${esc(p.category || 'Other')}</span>
          <h4>${esc(name)}</h4>
          <p>${esc(p.intuition || 'Master this pattern to unlock a whole class of problems.')}</p>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.04);">
          <span class="pat-mast-badge" style="color:${mColor}; background:${mColor}10;">${esc(p.mastery)}</span>
          <span style="font-family:var(--font-mono); font-size:11px; color:var(--ink-faint);">${p.questions ? p.questions.length : 0} Qs</span>
        </div>
      </div>`;
    });
    html += `</div>`;
  } 
  else if (viewMode === 'table') {
    html += `
      <div class="pattern-table-wrap">
        <table class="pattern-table">
          <thead>
            <tr>
              <th>Pattern Name</th>
              <th>Category</th>
              <th>Mastery</th>
              <th>Questions</th>
            </tr>
          </thead>
          <tbody>
    `;
    sortedNames.forEach(name => {
      const p = patternData[name];
      const catColor = catColors[p.category] || '#71717a';
      const mColor = masteryColors[p.mastery] || '#71717a';
      
      html += `
        <tr data-pattern-name="${esc(name)}">
          <td class="pt-title">${esc(name)}</td>
          <td><span class="pat-cat-badge" style="color:${catColor}; background:${catColor}15;">${esc(p.category || 'Other')}</span></td>
          <td><span class="pat-mast-badge" style="color:${mColor}; background:${mColor}10; border-color:${mColor}30;">${esc(p.mastery)}</span></td>
          <td class="pt-qs">${p.questions ? p.questions.length : 0} Tracked</td>
        </tr>
      `;
    });
    html += `</tbody></table></div>`;
  }
  
  host.innerHTML = html;
  host.querySelectorAll('[data-pattern-name]').forEach(el => {
    el.addEventListener('click', () => window.openPatternDetail(el.dataset.patternName));
  });
  
  // Render Most Repeated Questions
  renderMostRepeated();
};

function renderMostRepeated() {
  const host = document.getElementById('mostRepeated');
  if(!host) return;
  
  // Compute global frequency across all companies
  const globalFreq = {};
  Object.values(DATA.companies).forEach(companyList => {
    companyList.forEach(([pid, freq]) => {
      if(!globalFreq[pid]) globalFreq[pid] = { count: 0, sum: 0 };
      globalFreq[pid].count += 1;
      globalFreq[pid].sum += freq;
    });
  });
  
  const topQs = Object.entries(globalFreq)
    .sort((a,b) => b[1].count - a[1].count || b[1].sum - a[1].sum)
    .slice(0, 15);
    
  host.innerHTML = `<div class="pattern-table-wrap">
    <table class="pattern-table">
      <thead><tr><th>Problem</th><th>Difficulty</th><th>Companies</th><th>Cumulative Freq</th><th>Status</th></tr></thead>
      <tbody>
        ${topQs.map(([pid, stats]) => {
          const p = DATA.problems[pid];
          const st = (progress[pid]||{}).status || 'none';
          return `<tr data-pid="${pid}">
            <td class="pt-title"><a href="https://leetcode.com/problems/${esc(p[3])}/" target="_blank" style="color:var(--ink); text-decoration:none; transition:color 0.2s;" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--ink)'">${esc(p[0])}</a></td>
            <td><span class="diff-tag diff-${p[1]}">${diffLabel(p[1])}</span></td>
            <td style="font-family:var(--font-mono); font-size:12px; color:var(--ink-soft);">${stats.count}</td>
            <td style="font-family:var(--font-mono); font-size:12px; color:var(--ink-soft);">${Math.round(stats.sum)}</td>
            <td>
              <select class="status-select st-${st==='none'?'none':st}" data-pid="${pid}" style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:var(--ink); padding:4px 8px; border-radius:6px; font-size:12px; font-family:var(--font-mono);">
                <option value="none" ${st==='none'?'selected':''}>Not started</option>
                <option value="attempted" ${st==='attempted'?'selected':''}>Attempted</option>
                <option value="solved" ${st==='solved'?'selected':''}>Solved</option>
              </select>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>`;
  
  // Wire status dropdowns
  host.querySelectorAll('.status-select').forEach(sel=>{
    sel.addEventListener('change', async (e)=>{
      const pid = sel.dataset.pid;
      progress[pid] = progress[pid] || {};
      const prevStatus = progress[pid].status;
      progress[pid].status = sel.value;
      if (sel.value==='solved' && prevStatus!=='solved'){
        progress[pid].solvedAt = Date.now();
        fireConfetti();
        showToast('Nice — marked solved. Keep the streak going 🔥');
      }
      sel.className = 'status-select st-' + (sel.value==='none'?'none':sel.value);
      await storeSet('pd_progress_v1', progress);
      if(window.renderMotivStrip) window.renderMotivStrip();
    });
  });
}

document.querySelectorAll('#patternViewToggle button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#patternViewToggle button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    window.renderPatterns();
  });
});

let currentPattern = null;

window.openPatternDetail = function(name) {
  currentPattern = name;
  const p = patternData[name];
  document.getElementById('patternDetailTitle').textContent = name;
  document.getElementById('patternMasterySelect').value = p.mastery || 'New';
  
  const codeVal = p.boilerplate || '';
  const textarea = document.getElementById('patternCode');
  const codeDisplay = document.getElementById('patternCodeDisplay');
  const codeView = document.getElementById('patternCodeView');
  
  textarea.value = codeVal;
  textarea.style.display = 'none';
  codeView.style.display = 'block';
  codeDisplay.textContent = codeVal;
  codeDisplay.className = 'language-cpp'; // reset class for hljs
  if (window.hljs) hljs.highlightElement(codeDisplay);
  
  document.getElementById('patternIntuition').value = p.intuition || '';
  document.getElementById('patternWhenToUse').value = p.whenToUse || '';
  document.getElementById('patternMistakes').value = p.mistakes || '';
  document.getElementById('patternOptimal').value = p.optimal || '';
  
  renderPatternQuestions();
  document.getElementById('patternDetailModal').classList.add('open');
};

document.getElementById('toggleCodeEditBtn')?.addEventListener('click', (e) => {
  const textarea = document.getElementById('patternCode');
  const codeView = document.getElementById('patternCodeView');
  if (textarea.style.display === 'none') {
    textarea.style.display = 'block';
    codeView.style.display = 'none';
    e.target.textContent = '👀 View Highlighted';
  } else {
    textarea.style.display = 'none';
    codeView.style.display = 'block';
    e.target.textContent = '✏️ Edit Code';
    const codeDisplay = document.getElementById('patternCodeDisplay');
    codeDisplay.textContent = textarea.value;
    codeDisplay.className = 'language-cpp';
    if (window.hljs) hljs.highlightElement(codeDisplay);
  }
});

function renderPatternQuestions() {
  const p = patternData[currentPattern];
  const list = document.getElementById('patternQuestionsList');
  if(!p.questions || p.questions.length === 0) {
    list.innerHTML = `<span style="font-size:12px; color:var(--ink-soft);">No questions added yet.</span>`;
    return;
  }
  
  list.innerHTML = p.questions.map((q, idx) => `
    <div class="q-row">
      <a href="${esc(externalUrl(q.url))}" target="_blank" rel="noopener noreferrer">${esc(q.name)}</a>
      <button class="q-del" onclick="deletePatternQuestion(${idx})">×</button>
    </div>
  `).join('');
}

window.deletePatternQuestion = function(idx) {
  patternData[currentPattern].questions.splice(idx, 1);
  renderPatternQuestions();
};

document.getElementById('patternAddQuestionBtn').addEventListener('click', () => {
  const name = document.getElementById('newQName').value;
  const url = document.getElementById('newQUrl').value;
  if(name) {
    if(!patternData[currentPattern].questions) patternData[currentPattern].questions = [];
    patternData[currentPattern].questions.push({name, url});
    document.getElementById('newQName').value = '';
    document.getElementById('newQUrl').value = '';
    renderPatternQuestions();
  }
});

document.getElementById('patternDetailClose').addEventListener('click', () => {
  document.getElementById('patternDetailModal').classList.remove('open');
});

document.getElementById('patternDetailSave').addEventListener('click', async () => {
  const p = patternData[currentPattern];
  p.mastery = document.getElementById('patternMasterySelect').value;
  p.boilerplate = document.getElementById('patternCode').value;
  p.intuition = document.getElementById('patternIntuition').value;
  p.whenToUse = document.getElementById('patternWhenToUse').value;
  p.mistakes = document.getElementById('patternMistakes').value;
  p.optimal = document.getElementById('patternOptimal').value;
  
  await storeSet('pd_patterns_v1', patternData);
  document.getElementById('patternDetailModal').classList.remove('open');
  window.renderPatterns();
  showToast("Pattern notes saved!");
});

document.getElementById('patternDetailDelete').addEventListener('click', async () => {
  if (confirm(`Are you sure you want to delete the pattern "${currentPattern}"?`)) {
    delete patternData[currentPattern];
    await storeSet('pd_patterns_v1', patternData);
    document.getElementById('patternDetailModal').classList.remove('open');
    window.renderPatterns();
    showToast("Pattern deleted!");
  }
});

window.addNewPattern = async function() {
  const name = prompt("Enter new pattern name:");
  if (name && !patternData[name]) {
    patternData[name] = { mastery: 'New', boilerplate: '// C++ code here', intuition: '', whenToUse: '', mistakes: '', questions: [] };
    await storeSet('pd_patterns_v1', patternData);
    window.renderPatterns();
    showToast(`Pattern "${name}" added!`);
  }
};
