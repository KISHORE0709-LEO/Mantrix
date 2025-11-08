import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Course, Level, UserProgress, Badge, AICompanionState, GameResult, LevelStage } from "@shared/types";

interface User {
  id: number;
  username: string;
  email: string | null;
}

interface LearningState {
  user: User | null;
  courses: Course[];
  userProgress: UserProgress;
  aiCompanion: AICompanionState;
  
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string, email?: string) => Promise<void>;
  logout: () => void;
  syncProgress: () => Promise<void>;
  
  setCourses: (courses: Course[]) => void;
  selectCourse: (courseId: string) => void;
  selectLevel: (levelId: string) => void;
  advanceStage: (levelId: string, newStage: LevelStage) => boolean;
  goBackStage: (levelId: string) => boolean;
  startGame: (levelId: string) => boolean;
  completeGame: (levelId: string, result: GameResult) => Promise<void>;
  completeLevel: (levelId: string, xpEarned: number) => Promise<void>;
  addBadge: (badge: Badge) => Promise<void>;
  updateAIMessages: (message: { role: 'user' | 'assistant'; content: string }) => void;
  toggleAICompanion: () => void;
  setCurrentHint: (hint: string | null) => void;
}

const initialCourses: Course[] = [
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    description: 'Master the fundamentals of computer science',
    icon: '🧠',
    color: '#6366f1',
    levels: [
      { 
        id: 'dsa-1', 
        courseId: 'dsa', 
        title: 'Introduction to Programming', 
        description: 'Learn loops, variables, and conditionals', 
        story: 'Welcome to the Valley of Variables! Master loops and conditionals to begin your journey.', 
        xpReward: 100, 
        challengeType: 'interactive', 
        difficulty: 'beginner', 
        unlocked: true, 
        completed: false, 
        currentStage: 'narrative', 
        videoTopic: 'JavaScript loops and variables for beginners',
        aiSuggestedVideos: [
          {
            id: 'dsa1-v1',
            title: 'JavaScript Loops Explained in 10 Minutes',
            channelTitle: 'Programming with Mosh',
            thumbnailUrl: 'https://i.ytimg.com/vi/s9wW2PpJsmQ/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=s9wW2PpJsmQ'
          },
          {
            id: 'dsa1-v2',
            title: 'For Loops vs While Loops - JavaScript Tutorial',
            channelTitle: 'Web Dev Simplified',
            thumbnailUrl: 'https://i.ytimg.com/vi/PpeDy5wLvJo/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=PpeDy5wLvJo'
          },
          {
            id: 'dsa1-v3',
            title: 'JavaScript Variables - Let, Const, Var',
            channelTitle: 'Traversy Media',
            thumbnailUrl: 'https://i.ytimg.com/vi/9WIJQDvt4Us/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=9WIJQDvt4Us'
          }
        ],
        quizQuestions: [
          {
            id: 'dsa-1-q1',
            question: 'What will this code print? for (let i = 1; i <= 5; i++) { console.log(i); }',
            options: ['1 2 3 4 5', '0 1 2 3 4', '1 2 3 4', '0 1 2 3 4 5'],
            correctAnswer: '1 2 3 4 5',
            explanation: 'The loop starts at 1 and runs while i <= 5, printing numbers 1 through 5.',
            type: 'multiple-choice'
          },
          {
            id: 'dsa-1-q2',
            question: 'What keyword do you use to declare a variable that can be reassigned?',
            options: ['const', 'let', 'var', 'Both let and var'],
            correctAnswer: 'Both let and var',
            explanation: 'Both let and var allow reassignment. const creates constants that cannot be reassigned.',
            type: 'multiple-choice'
          }
        ],
        codingProblems: [
          {
            id: 'dsa-1-p1',
            title: 'Sum of Numbers',
            description: 'Write a function that calculates the sum of numbers from 1 to n using a loop.',
            difficulty: 'easy',
            starterCode: 'function sumNumbers(n) {\n  // Write your code here\n  \n}',
            solution: 'function sumNumbers(n) {\n  let sum = 0;\n  for (let i = 1; i <= n; i++) {\n    sum += i;\n  }\n  return sum;\n}',
            functionName: 'sumNumbers',
            testCases: [
              { id: 't1', input: '5', expectedOutput: '15', isHidden: false },
              { id: 't2', input: '10', expectedOutput: '55', isHidden: false },
              { id: 't3', input: '100', expectedOutput: '5050', isHidden: true }
            ],
            hints: [
              'Initialize a sum variable to 0',
              'Use a for loop from 1 to n',
              'Add each number to the sum'
            ],
            tags: ['loops', 'math', 'beginner']
          }
        ],
        externalResources: [
          {
            title: 'Two Sum - LeetCode',
            url: 'https://leetcode.com/problems/two-sum/',
            type: 'leetcode',
            difficulty: 'easy',
            description: 'Classic array problem using loops'
          },
          {
            title: 'JavaScript Loops - MDN',
            url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration',
            type: 'documentation',
            description: 'Complete guide to JavaScript loops'
          },
          {
            title: 'Loops Tutorial - NeetCode',
            url: 'https://neetcode.io/courses/lessons/loops-introduction',
            type: 'neetcode',
            difficulty: 'easy'
          }
        ],
        gameConfig: { id: 'loop-arena-1', type: 'loop-arena', title: 'Loop Arena: Valley of Variables', description: 'Learn loops by collecting items', objective: 'Collect all items using loop patterns', controls: 'WASD or Arrow Keys', passingScore: 90, importanceWhy: 'Loops are the heartbeat of programming - they let you repeat actions efficiently. This game shows you how loops work visually by having you collect items in patterns. Understanding loops is fundamental to solving any problem that requires repetition.' } 
      },
      { 
        id: 'dsa-2', 
        courseId: 'dsa', 
        title: 'Arrays & Lists', 
        description: 'Understanding indexed collections', 
        story: 'Enter the Array Temple where data is stored in ordered sequences.', 
        xpReward: 120, 
        challengeType: 'interactive', 
        difficulty: 'beginner', 
        unlocked: false, 
        completed: false, 
        currentStage: 'narrative',
        videoTopic: 'JavaScript arrays and array methods',
        aiSuggestedVideos: [
          {
            id: 'dsa2-v1',
            title: 'JavaScript Arrays Crash Course',
            channelTitle: 'Traversy Media',
            thumbnailUrl: 'https://i.ytimg.com/vi/7W4pQQ20nJg/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=7W4pQQ20nJg'
          },
          {
            id: 'dsa2-v2',
            title: '8 Must Know JavaScript Array Methods',
            channelTitle: 'Web Dev Simplified',
            thumbnailUrl: 'https://i.ytimg.com/vi/R8rmfD9Y5-c/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=R8rmfD9Y5-c'
          }
        ],
        quizQuestions: [
          {
            id: 'dsa-2-q1',
            question: 'How do you access the first element of an array named arr?',
            options: ['arr[0]', 'arr[1]', 'arr.first()', 'arr.get(0)'],
            correctAnswer: 'arr[0]',
            explanation: 'Arrays are zero-indexed, so the first element is at index 0.',
            type: 'multiple-choice'
          }
        ],
        codingProblems: [
          {
            id: 'dsa-2-p1',
            title: 'Find Maximum in Array',
            description: 'Write a function that finds the maximum number in an array.',
            difficulty: 'easy',
            starterCode: 'function findMax(arr) {\n  // Write your code here\n  \n}',
            solution: 'function findMax(arr) {\n  let max = arr[0];\n  for (let i = 1; i < arr.length; i++) {\n    if (arr[i] > max) max = arr[i];\n  }\n  return max;\n}',
            functionName: 'findMax',
            testCases: [
              { id: 't1', input: '[1, 5, 3, 9, 2]', expectedOutput: '9', isHidden: false },
              { id: 't2', input: '[-5, -1, -10]', expectedOutput: '-1', isHidden: false }
            ],
            hints: ['Start with the first element as max', 'Loop through the array', 'Update max if you find a larger value'],
            tags: ['arrays', 'loops', 'beginner']
          }
        ],
        externalResources: [
          {
            title: 'Contains Duplicate - LeetCode',
            url: 'https://leetcode.com/problems/contains-duplicate/',
            type: 'leetcode',
            difficulty: 'easy'
          },
          {
            title: 'Arrays - NeetCode Roadmap',
            url: 'https://neetcode.io/roadmap',
            type: 'neetcode'
          }
        ],
        gameConfig: { id: 'sorting-conveyor-2', type: 'sorting-conveyor', title: 'Array Organizer', description: 'Learn arrays by organizing items', objective: 'Sort items by value', controls: 'Click to swap items', passingScore: 100, importanceWhy: 'Arrays are the most fundamental data structure in programming. This game shows you how to access, manipulate, and organize data in arrays. Every app you use stores and manages lists of data using arrays.' } 
      },
      {
        id: 'dsa-3',
        courseId: 'dsa',
        title: 'Searching Algorithms',
        description: 'Linear and binary search',
        story: 'In the Forest of Search, find treasures using efficient search strategies.',
        narrative: 'The forest holds many treasures, but finding them requires strategy. Learn two fundamental search algorithms: linear search checks every item one by one, while binary search divides and conquers sorted data for lightning-fast lookups.',
        teachingContent: 'Linear Search: O(n) time - checks each element sequentially. Simple but slow for large datasets. Binary Search: O(log n) time - repeatedly divides sorted array in half. Much faster but requires sorted data.',
        xpReward: 130,
        challengeType: 'interactive',
        difficulty: 'beginner',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        videoTopic: 'Binary search algorithm explained with examples',
        quizQuestions: [
          {
            id: 'dsa-3-q1',
            question: 'What is the time complexity of binary search?',
            options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
            correctAnswer: 'O(log n)',
            explanation: 'Binary search divides the search space in half each time, giving logarithmic time complexity.',
            type: 'multiple-choice'
          },
          {
            id: 'dsa-3-q2',
            question: 'What condition must be met to use binary search?',
            options: ['Array must be sorted', 'Array must be unsorted', 'Array must have duplicates', 'Array must be empty'],
            correctAnswer: 'Array must be sorted',
            explanation: 'Binary search only works on sorted arrays because it relies on comparing the middle element to determine which half to search.',
            type: 'multiple-choice'
          }
        ],
        codingProblems: [
          {
            id: 'dsa-3-p1',
            title: 'Binary Search Implementation',
            description: 'Write a function that performs binary search on a sorted array. Return the index of the target value, or -1 if not found.',
            difficulty: 'medium',
            starterCode: 'function binarySearch(arr, target) {\n  // Write your code here\n  \n}',
            solution: 'function binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  \n  while (left <= right) {\n    let mid = Math.floor((left + right) / 2);\n    \n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  \n  return -1;\n}',
            functionName: 'binarySearch',
            testCases: [
              { id: 't1', input: '[[1, 3, 5, 7, 9], 5]', expectedOutput: '2', isHidden: false },
              { id: 't2', input: '[[1, 3, 5, 7, 9], 6]', expectedOutput: '-1', isHidden: false },
              { id: 't3', input: '[[10, 20, 30, 40, 50], 10]', expectedOutput: '0', isHidden: true }
            ],
            hints: [
              'Use two pointers: left and right',
              'Find the middle index: Math.floor((left + right) / 2)',
              'Compare middle element with target to decide which half to search'
            ],
            tags: ['searching', 'binary-search', 'algorithms']
          }
        ],
        externalResources: [
          {
            title: 'Binary Search - LeetCode',
            url: 'https://leetcode.com/problems/binary-search/',
            type: 'leetcode',
            difficulty: 'easy',
            description: 'Classic binary search problem'
          },
          {
            title: 'Search Insert Position - LeetCode',
            url: 'https://leetcode.com/problems/search-insert-position/',
            type: 'leetcode',
            difficulty: 'easy',
            description: 'Binary search variation'
          },
          {
            title: 'Binary Search - NeetCode',
            url: 'https://neetcode.io/problems/binary-search',
            type: 'neetcode',
            difficulty: 'easy'
          }
        ],
        gameConfig: {
          id: 'search-challenge-3',
          type: 'search-challenge',
          title: 'Treasure Hunt',
          description: 'Find hidden items using search algorithms',
          objective: 'Locate all treasures efficiently',
          controls: 'Click to search, use hints wisely',
          passingScore: 85,
          importanceWhy: 'Search algorithms are essential for finding data efficiently. This game demonstrates the dramatic difference between linear and binary search - understanding when to use each can make your programs run 1000x faster on large datasets.'
        }
      },
      {
        id: 'dsa-4',
        courseId: 'dsa',
        title: 'Linked Lists',
        description: 'Understanding node-based data structures',
        story: 'Navigate the Chain Bridge where each node points to the next.',
        narrative: 'In the realm of data structures, linked lists offer dynamic memory allocation where elements (nodes) connect via pointers. Unlike arrays, linked lists excel at insertions and deletions.',
        teachingContent: 'A linked list consists of nodes, each containing data and a reference (pointer) to the next node. Types include singly linked lists, doubly linked lists, and circular linked lists.',
        xpReward: 140,
        challengeType: 'interactive',
        difficulty: 'beginner',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        videoTopic: 'Linked lists data structure explained with examples',
        quizQuestions: [
          {
            id: 'dsa-4-q1',
            question: 'What is the time complexity of inserting a node at the beginning of a linked list?',
            options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
            correctAnswer: 'O(1)',
            explanation: 'Inserting at the beginning only requires updating the head pointer and the new node\'s next pointer, taking constant time.',
            type: 'multiple-choice'
          },
          {
            id: 'dsa-4-q2',
            question: 'What advantage do linked lists have over arrays?',
            options: ['Random access', 'Dynamic size', 'Less memory usage', 'Faster search'],
            correctAnswer: 'Dynamic size',
            explanation: 'Linked lists can grow and shrink dynamically without pre-allocating memory like arrays.',
            type: 'multiple-choice'
          }
        ],
        codingProblems: [
          {
            id: 'dsa-4-p1',
            title: 'Reverse Linked List',
            description: 'Reverse a singly linked list and return the new head.',
            difficulty: 'medium',
            starterCode: 'function reverseList(head) {\n  // head is the first node with properties: val and next\n  // Write your code here\n  \n}',
            solution: 'function reverseList(head) {\n  let prev = null;\n  let current = head;\n  while (current) {\n    let next = current.next;\n    current.next = prev;\n    prev = current;\n    current = next;\n  }\n  return prev;\n}',
            functionName: 'reverseList',
            testCases: [
              { id: 't1', input: '[{"val":1,"next":{"val":2,"next":{"val":3,"next":null}}}]', expectedOutput: '{"val":3,"next":{"val":2,"next":{"val":1,"next":null}}}', isHidden: false },
              { id: 't2', input: '[null]', expectedOutput: 'null', isHidden: false }
            ],
            hints: ['Use three pointers: prev, current, and next', 'Iterate through the list reversing pointers', 'Return prev at the end'],
            tags: ['linked-list', 'pointers']
          }
        ],
        externalResources: [
          {
            title: 'Reverse Linked List - LeetCode',
            url: 'https://leetcode.com/problems/reverse-linked-list/',
            type: 'leetcode',
            difficulty: 'easy'
          },
          {
            title: 'Linked List Cycle - LeetCode',
            url: 'https://leetcode.com/problems/linked-list-cycle/',
            type: 'leetcode',
            difficulty: 'easy'
          },
          {
            title: 'Linked Lists - NeetCode',
            url: 'https://neetcode.io/roadmap',
            type: 'neetcode'
          }
        ],
        gameConfig: {
          id: 'pattern-builder-4',
          type: 'pattern-builder',
          title: 'Chain Bridge Navigator',
          description: 'Build and traverse linked list chains',
          objective: 'Connect nodes correctly to form a path',
          controls: 'Click to connect nodes',
          passingScore: 85,
          importanceWhy: 'Linked lists are fundamental to understanding pointers and dynamic data structures. They\'re used in many applications like browser history, music playlists, and implementing other data structures like stacks and queues.'
        }
      },
      {
        id: 'dsa-5',
        courseId: 'dsa',
        title: 'Stacks',
        description: 'Last-In-First-Out (LIFO) operations',
        story: 'Climb the Tower of Stacks where the last item added is first removed.',
        narrative: 'Stacks are fundamental data structures following LIFO principle. Perfect for undo operations, expression evaluation, and backtracking algorithms.',
        teachingContent: 'A stack supports push (add to top), pop (remove from top), and peek (view top) operations. Think of a stack of plates - you can only add or remove from the top.',
        xpReward: 150,
        challengeType: 'interactive',
        difficulty: 'beginner',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        videoTopic: 'Stack data structure and applications tutorial',
        quizQuestions: [
          {
            id: 'dsa-5-q1',
            question: 'Which operation is NOT supported by a standard stack?',
            options: ['push', 'pop', 'peek', 'random access'],
            correctAnswer: 'random access',
            explanation: 'Stacks only allow access to the top element, not random access to middle elements.',
            type: 'multiple-choice'
          }
        ],
        codingProblems: [
          {
            id: 'dsa-5-p1',
            title: 'Valid Parentheses',
            description: 'Given a string containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid. An input string is valid if brackets close in the correct order.',
            difficulty: 'easy',
            starterCode: 'function isValid(s) {\n  // Write your code here\n  \n}',
            solution: 'function isValid(s) {\n  const stack = [];\n  const pairs = {\"(\": \")\", \"{\": \"}\", \"[\": \"]\"};\n  for (let char of s) {\n    if (pairs[char]) stack.push(char);\n    else if (stack.length === 0 || pairs[stack.pop()] !== char) return false;\n  }\n  return stack.length === 0;\n}',
            functionName: 'isValid',
            testCases: [
              { id: 't1', input: '"()"', expectedOutput: 'true', isHidden: false },
              { id: 't2', input: '"()[]{}"', expectedOutput: 'true', isHidden: false },
              { id: 't3', input: '"(]"', expectedOutput: 'false', isHidden: false }
            ],
            hints: ['Use a stack to keep track of opening brackets', 'When you see a closing bracket, check if it matches the top of the stack'],
            tags: ['stack', 'string']
          }
        ],
        externalResources: [
          {
            title: 'Valid Parentheses - LeetCode',
            url: 'https://leetcode.com/problems/valid-parentheses/',
            type: 'leetcode',
            difficulty: 'easy'
          },
          {
            title: 'Stacks - NeetCode',
            url: 'https://neetcode.io/roadmap',
            type: 'neetcode'
          }
        ],
        gameConfig: {
          id: 'pattern-builder-5',
          type: 'pattern-builder',
          title: 'Stack Tower',
          description: 'Build towers using stack operations',
          objective: 'Manage items using LIFO principle',
          controls: 'Click to push/pop',
          passingScore: 85
        }
      },
      {
        id: 'dsa-6',
        courseId: 'dsa',
        title: 'Queues',
        description: 'First-In-First-Out (FIFO) operations',
        story: 'Join the Queue Kingdom where fairness rules - first come, first served!',
        narrative: 'Queues follow the FIFO principle - first element added is first removed. Essential for BFS, scheduling, and real-world queue simulations.',
        teachingContent: 'A queue supports enqueue (add to rear), dequeue (remove from front), and peek (view front) operations. Like a line at a store.',
        xpReward: 150,
        challengeType: 'interactive',
        difficulty: 'beginner',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        videoTopic: 'Queue data structure implementation and use cases',
        quizQuestions: [
          {
            id: 'dsa-6-q1',
            question: 'In a queue, where are new elements added?',
            options: ['Front', 'Rear', 'Middle', 'Random position'],
            correctAnswer: 'Rear',
            explanation: 'In a queue, elements are added at the rear and removed from the front (FIFO).',
            type: 'multiple-choice'
          }
        ],
        codingProblems: [
          {
            id: 'dsa-6-p1',
            title: 'Implement Queue using Stacks',
            description: 'Implement a queue using two stacks.',
            difficulty: 'easy',
            starterCode: 'class MyQueue {\n  constructor() {\n    this.stack1 = [];\n    this.stack2 = [];\n  }\n  \n  enqueue(x) {\n    // Write your code here\n  }\n  \n  dequeue() {\n    // Write your code here\n  }\n}',
            solution: 'class MyQueue {\n  constructor() {\n    this.stack1 = [];\n    this.stack2 = [];\n  }\n  enqueue(x) {\n    this.stack1.push(x);\n  }\n  dequeue() {\n    if (this.stack2.length === 0) {\n      while (this.stack1.length > 0) {\n        this.stack2.push(this.stack1.pop());\n      }\n    }\n    return this.stack2.pop();\n  }\n}',
            functionName: 'MyQueue',
            testCases: [
              { id: 't1', input: '["enqueue",1,"enqueue",2,"dequeue"]', expectedOutput: '1', isHidden: false }
            ],
            hints: ['Use one stack for enqueue, another for dequeue', 'Transfer elements when dequeue stack is empty'],
            tags: ['queue', 'stack']
          }
        ],
        externalResources: [
          {
            title: 'Implement Queue using Stacks - LeetCode',
            url: 'https://leetcode.com/problems/implement-queue-using-stacks/',
            type: 'leetcode',
            difficulty: 'easy'
          },
          {
            title: 'Queues - NeetCode',
            url: 'https://neetcode.io/roadmap',
            type: 'neetcode'
          }
        ],
        gameConfig: {
          id: 'sorting-conveyor-6',
          type: 'sorting-conveyor',
          title: 'Queue Kingdom',
          description: 'Process items in FIFO order',
          objective: 'Manage queue operations correctly',
          controls: 'Click to enqueue/dequeue',
          passingScore: 85
        }
      },
      {
        id: 'dsa-7',
        courseId: 'dsa',
        title: 'Hash Tables',
        description: 'Key-value pairs and hashing',
        story: 'Unlock the Hash Vault where keys open instant access to treasures.',
        narrative: 'Hash tables provide O(1) average-case lookup, insert, and delete operations using key-value pairs and hash functions.',
        teachingContent: 'Hash tables use a hash function to compute an index into an array of buckets. Collision resolution techniques include chaining and open addressing.',
        xpReward: 160,
        challengeType: 'interactive',
        difficulty: 'intermediate',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        videoTopic: 'Hash tables and hash maps explained',
        quizQuestions: [
          {
            id: 'dsa-7-q1',
            question: 'What is the average time complexity of hash table lookup?',
            options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
            correctAnswer: 'O(1)',
            explanation: 'Hash tables provide constant-time average-case lookup using hash functions.',
            type: 'multiple-choice'
          }
        ],
        codingProblems: [
          {
            id: 'dsa-7-p1',
            title: 'Two Sum',
            description: 'Given an array of integers and a target, return indices of two numbers that add up to target.',
            difficulty: 'easy',
            starterCode: 'function twoSum(nums, target) {\n  // Write your code here\n  \n}',
            solution: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}',
            functionName: 'twoSum',
            testCases: [
              { id: 't1', input: '[[2,7,11,15], 9]', expectedOutput: '[0,1]', isHidden: false },
              { id: 't2', input: '[[3,2,4], 6]', expectedOutput: '[1,2]', isHidden: false }
            ],
            hints: ['Use a hash map to store seen numbers and their indices', 'For each number, check if target - number exists in the map'],
            tags: ['hash-table', 'array']
          }
        ],
        externalResources: [
          {
            title: 'Two Sum - LeetCode',
            url: 'https://leetcode.com/problems/two-sum/',
            type: 'leetcode',
            difficulty: 'easy'
          },
          {
            title: 'Hash Tables - NeetCode',
            url: 'https://neetcode.io/roadmap',
            type: 'neetcode'
          }
        ],
        gameConfig: {
          id: 'search-challenge-7',
          type: 'search-challenge',
          title: 'Hash Vault',
          description: 'Use hashing to find treasures instantly',
          objective: 'Implement hash-based lookups',
          controls: 'Click to hash and search',
          passingScore: 85
        }
      },
      {
        id: 'dsa-8',
        courseId: 'dsa',
        title: 'Binary Trees',
        description: 'Hierarchical tree structures',
        story: 'Explore the Binary Forest where each node has at most two children.',
        narrative: 'Trees are hierarchical data structures with a root node and child nodes. Binary trees limit each node to at most two children.',
        teachingContent: 'Binary trees have applications in file systems, databases, and expression parsing. Each node contains data and pointers to left and right children.',
        xpReward: 170,
        challengeType: 'interactive',
        difficulty: 'intermediate',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        videoTopic: 'Binary trees structure and basic operations',
        quizQuestions: [{id: 'dsa-8-q1', question: 'What is the maximum number of children a node can have in a binary tree?', options: ['1', '2', '3', 'Unlimited'], correctAnswer: '2', explanation: 'Binary trees by definition have at most two children per node.', type: 'multiple-choice'}],
        codingProblems: [{id: 'dsa-8-p1', title: 'Tree Height', description: 'Calculate the height of a binary tree.', difficulty: 'easy', starterCode: 'function maxDepth(root) {\n  // Write your code here\n  \n}', solution: 'function maxDepth(root) {\n  if (!root) return 0;\n  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}', functionName: 'maxDepth', testCases: [{id: 't1', input: '[null]', expectedOutput: '0'}], hints: ['Use recursion', 'Base case: null node has height 0'], tags: ['tree', 'recursion']}],
        externalResources: [{title: 'Maximum Depth of Binary Tree - LeetCode', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', type: 'leetcode', difficulty: 'easy'}, {title: 'Binary Trees - NeetCode', url: 'https://neetcode.io/roadmap', type: 'neetcode'}],
        gameConfig: {id: 'recursion-maze-8', type: 'recursion-maze', title: 'Binary Forest Explorer', description: 'Navigate through binary tree structures', objective: 'Traverse the tree correctly', controls: 'Arrow Keys', passingScore: 85}
      },
      {
        id: 'dsa-9',
        courseId: 'dsa',
        title: 'Binary Search Trees',
        description: 'Ordered binary trees for fast lookup',
        story: 'Master the BST Cathedral where left is less, right is more.',
        narrative: 'BSTs maintain order: left subtree < root < right subtree. This enables O(log n) search, insert, and delete.',
        teachingContent: 'BST property: all left descendants < node < all right descendants. Balanced BSTs guarantee logarithmic operations.',
        xpReward: 180,
        challengeType: 'interactive',
        difficulty: 'intermediate',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        videoTopic: 'Binary search trees and BST operations',
        quizQuestions: [{id: 'dsa-9-q1', question: 'In a BST, where are smaller values located relative to a node?', options: ['Left subtree', 'Right subtree', 'Parent', 'Either side'], correctAnswer: 'Left subtree', explanation: 'BST property requires smaller values in left subtree.', type: 'multiple-choice'}],
        codingProblems: [{id: 'dsa-9-p1', title: 'Validate BST', description: 'Determine if a binary tree is a valid BST.', difficulty: 'medium', starterCode: 'function isValidBST(root) {\n  // Write your code here\n  \n}', solution: 'function isValidBST(root, min = -Infinity, max = Infinity) {\n  if (!root) return true;\n  if (root.val <= min || root.val >= max) return false;\n  return isValidBST(root.left, min, root.val) && isValidBST(root.right, root.val, max);\n}', functionName: 'isValidBST', testCases: [{id: 't1', input: '[null]', expectedOutput: 'true'}], hints: ['Check BST property recursively', 'Pass min/max constraints down'], tags: ['bst', 'tree']}],
        externalResources: [{title: 'Validate BST - LeetCode', url: 'https://leetcode.com/problems/validate-binary-search-tree/', type: 'leetcode', difficulty: 'medium'}, {title: 'BST Problems - NeetCode', url: 'https://neetcode.io/roadmap', type: 'neetcode'}],
        gameConfig: {id: 'search-challenge-9', type: 'search-challenge', title: 'BST Cathedral', description: 'Navigate ordered binary search trees', objective: 'Find values using BST property', controls: 'Click to search', passingScore: 85, importanceWhy: 'BSTs combine the benefits of arrays and linked lists. This game shows how the BST property (left < root < right) enables O(log n) searches, making databases and file systems incredibly fast.'}
      },
      {
        id: 'dsa-10',
        courseId: 'dsa',
        title: 'Tree Traversals',
        description: 'Inorder, preorder, postorder, and level-order',
        story: 'Navigate the Traversal Maze using different paths through the trees.',
        narrative: 'Different traversal orders visit nodes in specific sequences: inorder (left-root-right), preorder (root-left-right), postorder (left-right-root), level-order (breadth-first).',
        teachingContent: 'Inorder gives sorted sequence for BST. Preorder good for copying trees. Postorder useful for deletion. Level-order uses queue.',
        xpReward: 190,
        challengeType: 'interactive',
        difficulty: 'intermediate',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        videoTopic: 'Tree traversal algorithms: inorder, preorder, postorder, level-order',
        quizQuestions: [{id: 'dsa-10-q1', question: 'Which traversal visits nodes in sorted order for a BST?', options: ['Inorder', 'Preorder', 'Postorder', 'Level-order'], correctAnswer: 'Inorder', explanation: 'Inorder traversal (left-root-right) produces sorted sequence for BST.', type: 'multiple-choice'}],
        codingProblems: [{id: 'dsa-10-p1', title: 'Inorder Traversal', description: 'Return inorder traversal of a binary tree.', difficulty: 'easy', starterCode: 'function inorderTraversal(root) {\n  // Return array of values\n  \n}', solution: 'function inorderTraversal(root) {\n  if (!root) return [];\n  return [...inorderTraversal(root.left), root.val, ...inorderTraversal(root.right)];\n}', functionName: 'inorderTraversal', testCases: [{id: 't1', input: '[null]', expectedOutput: '[]'}], hints: ['Recursively traverse left, visit root, traverse right'], tags: ['tree', 'traversal']}],
        externalResources: [{title: 'Binary Tree Inorder Traversal - LeetCode', url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/', type: 'leetcode', difficulty: 'easy'}, {title: 'Tree Traversals - NeetCode', url: 'https://neetcode.io/roadmap', type: 'neetcode'}],
        gameConfig: {id: 'recursion-maze-10', type: 'recursion-maze', title: 'Traversal Maze', description: 'Navigate using tree traversal patterns', objective: 'Reach all checkpoints in order', controls: 'Arrow Keys', passingScore: 90, importanceWhy: 'Tree traversals are fundamental to working with hierarchical data. This game demonstrates different traversal orders - each one is perfect for specific tasks like copying trees, deleting nodes, or processing data in sorted order.'}
      },
      {id: 'dsa-11', courseId: 'dsa', title: 'Heaps & Priority Queues', description: 'Min-heap and max-heap structures', story: 'Scale the Heap Mountain where priority determines position.', narrative: 'Heaps are specialized trees where parent is always greater/less than children. Priority queues use heaps for O(log n) insert/extract.', teachingContent: 'Min-heap: parent < children. Max-heap: parent > children. Used in Dijkstra\'s algorithm, heap sort, scheduling systems.', xpReward: 200, challengeType: 'interactive', difficulty: 'intermediate', unlocked: false, completed: false, currentStage: 'narrative', videoTopic: 'Heaps and priority queues explained', quizQuestions: [{id: 'dsa-11-q1', question: 'What is the time complexity of heap insert?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correctAnswer: 'O(log n)', explanation: 'Heap insert requires bubbling up, which is O(log n).', type: 'multiple-choice'}], codingProblems: [{id: 'dsa-11-p1', title: 'Kth Largest Element', description: 'Find the kth largest element using a heap.', difficulty: 'medium', starterCode: 'function findKthLargest(nums, k) {\n  // Write your code here\n  \n}', solution: 'function findKthLargest(nums, k) {\n  nums.sort((a,b) => b-a);\n  return nums[k-1];\n}', functionName: 'findKthLargest', testCases: [{id: 't1', input: '[[3,2,1,5,6,4], 2]', expectedOutput: '5'}], hints: ['Sort array descending', 'Return element at index k-1'], tags: ['heap']}], externalResources: [{title: 'Kth Largest Element - LeetCode', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', type: 'leetcode', difficulty: 'medium'}, {title: 'Heaps - NeetCode', url: 'https://neetcode.io/roadmap', type: 'neetcode'}], gameConfig: {id: 'pattern-builder-11', type: 'pattern-builder', title: 'Heap Mountain', description: 'Build and maintain heap structures', objective: 'Keep heap property intact', controls: 'Click to insert/extract', passingScore: 85, importanceWhy: 'Heaps power priority queues used everywhere - task schedulers, event systems, Dijkstra\'s shortest path algorithm. This game shows how heaps maintain priority order efficiently.'}},
      {id: 'dsa-12', courseId: 'dsa', title: 'Graphs - Basics', description: 'Vertices, edges, and representations', story: 'Map the Graph Galaxy where everything connects to everything.', narrative: 'Graphs model connections: social networks, maps, dependencies. Vertices (nodes) connect via edges.', teachingContent: 'Adjacency list vs matrix. Directed vs undirected. Weighted vs unweighted graphs.', xpReward: 210, challengeType: 'interactive', difficulty: 'intermediate', unlocked: false, completed: false, currentStage: 'narrative', videoTopic: 'Graph data structures and representations', quizQuestions: [{id: 'dsa-12-q1', question: 'Which graph representation is more space-efficient for sparse graphs?', options: ['Adjacency Matrix', 'Adjacency List', 'Both equal', 'Neither'], correctAnswer: 'Adjacency List', explanation: 'Adjacency list only stores existing edges, saving space in sparse graphs.', type: 'multiple-choice'}], codingProblems: [{id: 'dsa-12-p1', title: 'Build Adjacency List', description: 'Convert edge list to adjacency list representation.', difficulty: 'easy', starterCode: 'function buildGraph(edges) {\n  // Return adjacency list\n  \n}', solution: 'function buildGraph(edges) {\n  const graph = {};\n  for (let [u,v] of edges) {\n    if (!graph[u]) graph[u] = [];\n    if (!graph[v]) graph[v] = [];\n    graph[u].push(v);\n    graph[v].push(u);\n  }\n  return graph;\n}', functionName: 'buildGraph', testCases: [{id: 't1', input: '[[[1,2],[1,3]]]', expectedOutput: '{"1":[2,3],"2":[1],"3":[1]}'}], hints: ['Initialize empty object for graph', 'For each edge, add connections both ways'], tags: ['graph']}], externalResources: [{title: 'Graph Theory - LeetCode', url: 'https://leetcode.com/tag/graph/', type: 'leetcode'}, {title: 'Graphs - NeetCode', url: 'https://neetcode.io/roadmap', type: 'neetcode'}], gameConfig: {id: 'search-challenge-12', type: 'search-challenge', title: 'Graph Galaxy', description: 'Connect vertices and explore graphs', objective: 'Build graph structures', controls: 'Click to connect nodes', passingScore: 85, importanceWhy: 'Graphs model real-world networks - social media, GPS systems, recommendation engines. This game shows how to represent and navigate connections, a skill used in countless applications.'}},
      {id: 'dsa-13', courseId: 'dsa', title: 'Graph Traversals (DFS/BFS)', description: 'Depth-first and breadth-first search', story: 'Explore the Network Nexus using systematic traversal strategies.', narrative: 'DFS explores deep before backtracking. BFS explores level by level. Essential for pathfinding and connectivity.', teachingContent: 'DFS uses stack/recursion. BFS uses queue. DFS for topological sort, BFS for shortest path in unweighted graphs.', xpReward: 220, challengeType: 'interactive', difficulty: 'advanced', unlocked: false, completed: false, currentStage: 'narrative', videoTopic: 'Graph traversal: DFS and BFS algorithms', quizQuestions: [{id: 'dsa-13-q1', question: 'Which data structure does BFS use?', options: ['Stack', 'Queue', 'Heap', 'Tree'], correctAnswer: 'Queue', explanation: 'BFS uses a queue to process nodes level by level.', type: 'multiple-choice'}], codingProblems: [{id: 'dsa-13-p1', title: 'Number of Islands', description: 'Count islands using DFS/BFS in a 2D grid.', difficulty: 'medium', starterCode: 'function numIslands(grid) {\n  // Write your code here\n  \n}', solution: 'function numIslands(grid) {\n  let count = 0;\n  for (let i = 0; i < grid.length; i++) {\n    for (let j = 0; j < grid[0].length; j++) {\n      if (grid[i][j] === "1") {\n        count++;\n        dfs(grid, i, j);\n      }\n    }\n  }\n  return count;\n}\nfunction dfs(grid, i, j) {\n  if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] === "0") return;\n  grid[i][j] = "0";\n  dfs(grid, i+1, j);\n  dfs(grid, i-1, j);\n  dfs(grid, i, j+1);\n  dfs(grid, i, j-1);\n}', functionName: 'numIslands', testCases: [{id: 't1', input: '[[["1","1"],["1","0"]]]', expectedOutput: '1'}], hints: ['Use DFS to mark connected land', 'Count how many times you start a new DFS'], tags: ['graph', 'dfs']}], externalResources: [{title: 'Number of Islands - LeetCode', url: 'https://leetcode.com/problems/number-of-islands/', type: 'leetcode', difficulty: 'medium'}, {title: 'Graph Traversal - NeetCode', url: 'https://neetcode.io/roadmap', type: 'neetcode'}], gameConfig: {id: 'recursion-maze-13', type: 'recursion-maze', title: 'Network Nexus', description: 'Traverse graphs using DFS and BFS', objective: 'Visit all nodes systematically', controls: 'Arrow Keys', passingScore: 85, importanceWhy: 'Graph traversals power everything from Google searches to finding the shortest route in GPS. This game teaches you how DFS and BFS systematically explore networks.'}},
      {id: 'dsa-14', courseId: 'dsa', title: 'Sorting - Bubble & Selection', description: 'Simple comparison-based sorting', story: 'Start at the Sorting Academy with fundamental techniques.', narrative: 'Bubble sort repeatedly swaps adjacent elements. Selection sort finds minimum and places it. Both O(n²) but educational.', teachingContent: 'Bubble: compare adjacent, swap if wrong order. Selection: find min, swap with first unsorted.', xpReward: 230, challengeType: 'interactive', difficulty: 'intermediate', unlocked: false, completed: false, currentStage: 'narrative', videoTopic: 'Bubble sort and selection sort algorithms', quizQuestions: [{id: 'dsa-14-q1', question: 'What is the time complexity of bubble sort?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)'], correctAnswer: 'O(n²)', explanation: 'Bubble sort has nested loops, resulting in O(n²) time complexity.', type: 'multiple-choice'}], codingProblems: [{id: 'dsa-14-p1', title: 'Implement Bubble Sort', description: 'Sort an array using bubble sort algorithm.', difficulty: 'easy', starterCode: 'function bubbleSort(arr) {\n  // Write your code here\n  \n}', solution: 'function bubbleSort(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = 0; j < arr.length - i - 1; j++) {\n      if (arr[j] > arr[j+1]) {\n        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];\n      }\n    }\n  }\n  return arr;\n}', functionName: 'bubbleSort', testCases: [{id: 't1', input: '[[5,2,8,1]]', expectedOutput: '[1,2,5,8]'}], hints: ['Use nested loops', 'Swap adjacent elements if out of order'], tags: ['sorting']}], externalResources: [{title: 'Sort an Array - LeetCode', url: 'https://leetcode.com/problems/sort-an-array/', type: 'leetcode', difficulty: 'medium'}, {title: 'Sorting - NeetCode', url: 'https://neetcode.io/roadmap', type: 'neetcode'}], gameConfig: {id: 'sorting-conveyor-14', type: 'sorting-conveyor', title: 'Sorting Academy', description: 'Sort items using basic algorithms', objective: 'Arrange items in order', controls: 'Click to swap', passingScore: 85, importanceWhy: 'Sorting is fundamental to computer science. This game shows basic sorting algorithms that teach you how to think about organizing data step-by-step.'}},
      {id: 'dsa-15', courseId: 'dsa', title: 'Sorting - Merge & Quick', description: 'Divide-and-conquer sorting algorithms', story: 'Master advanced sorting in the Algorithm Arena.', narrative: 'Merge sort divides, sorts, merges. Quick sort picks pivot, partitions. Both O(n log n) average case.', teachingContent: 'Merge sort: stable, predictable O(n log n). Quick sort: in-place, faster average but O(n²) worst case.', xpReward: 240, challengeType: 'interactive', difficulty: 'advanced', unlocked: false, completed: false, currentStage: 'narrative', videoTopic: 'Merge sort and quick sort algorithms explained', quizQuestions: [{id: 'dsa-15-q1', question: 'Which sorting algorithm is stable?', options: ['Quick Sort', 'Merge Sort', 'Heap Sort', 'Selection Sort'], correctAnswer: 'Merge Sort', explanation: 'Merge sort maintains relative order of equal elements (stable).', type: 'multiple-choice'}], codingProblems: [{id: 'dsa-15-p1', title: 'Implement Merge Sort', description: 'Sort an array using merge sort.', difficulty: 'medium', starterCode: 'function mergeSort(arr) {\n  // Write your code here\n  \n}', solution: 'function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}\nfunction merge(left, right) {\n  const result = [];\n  let i = 0, j = 0;\n  while (i < left.length && j < right.length) {\n    if (left[i] < right[j]) result.push(left[i++]);\n    else result.push(right[j++]);\n  }\n  return result.concat(left.slice(i)).concat(right.slice(j));\n}', functionName: 'mergeSort', testCases: [{id: 't1', input: '[[5,2,8,1,9]]', expectedOutput: '[1,2,5,8,9]'}], hints: ['Divide array in half recursively', 'Merge sorted halves'], tags: ['sorting', 'recursion']}], externalResources: [{title: 'Sort an Array - LeetCode', url: 'https://leetcode.com/problems/sort-an-array/', type: 'leetcode', difficulty: 'medium'}, {title: 'Sorting Algorithms - NeetCode', url: 'https://neetcode.io/roadmap', type: 'neetcode'}], gameConfig: {id: 'sorting-conveyor-15', type: 'sorting-conveyor', title: 'Algorithm Arena', description: 'Master advanced sorting techniques', objective: 'Efficiently sort large datasets', controls: 'Click to partition/merge', passingScore: 85, importanceWhy: 'Efficient sorting algorithms like merge sort and quick sort are used in every programming language\'s built-in sort. Understanding divide-and-conquer techniques is crucial for advanced programming.'}},
      {id: 'dsa-16', courseId: 'dsa', title: 'Recursion', description: 'Functions calling themselves', story: 'Descend into the Recursive Abyss where functions call themselves infinitely.', narrative: 'Recursion solves problems by breaking them into smaller subproblems. Base case prevents infinite recursion.', teachingContent: 'Every recursive function needs: base case (when to stop) and recursive case (how to make progress).', xpReward: 250, challengeType: 'interactive', difficulty: 'advanced', unlocked: false, completed: false, currentStage: 'narrative', videoTopic: 'Recursion fundamentals and problem-solving', quizQuestions: [{id: 'dsa-16-q1', question: 'What prevents infinite recursion?', options: ['Base case', 'Recursive case', 'Return statement', 'Loop'], correctAnswer: 'Base case', explanation: 'Base case stops recursion by providing a direct answer.', type: 'multiple-choice'}], codingProblems: [{id: 'dsa-16-p1', title: 'Fibonacci Number', description: 'Calculate nth Fibonacci number using recursion.', difficulty: 'easy', starterCode: 'function fib(n) {\n  // Write your code here\n  \n}', solution: 'function fib(n) {\n  if (n <= 1) return n;\n  return fib(n-1) + fib(n-2);\n}', functionName: 'fib', testCases: [{id: 't1', input: '5', expectedOutput: '5'}, {id: 't2', input: '10', expectedOutput: '55'}], hints: ['Base case: fib(0)=0, fib(1)=1', 'Recursive case: fib(n) = fib(n-1) + fib(n-2)'], tags: ['recursion']}], externalResources: [{title: 'Fibonacci Number - LeetCode', url: 'https://leetcode.com/problems/fibonacci-number/', type: 'leetcode', difficulty: 'easy'}, {title: 'Recursion - NeetCode', url: 'https://neetcode.io/roadmap', type: 'neetcode'}], gameConfig: {id: 'recursion-maze-16', type: 'recursion-maze', title: 'Recursive Abyss', description: 'Navigate using recursive thinking', objective: 'Solve problems recursively', controls: 'Arrow Keys', passingScore: 85, importanceWhy: 'Recursion is a powerful problem-solving technique that breaks complex problems into simpler ones. This game visualizes how recursive calls work together to solve problems elegantly.'}},
      {id: 'dsa-17', courseId: 'dsa', title: 'Backtracking', description: 'Exploring all possibilities', story: 'Navigate the Backtracking Labyrinth by trying all paths.', narrative: 'Backtracking tries all solutions, abandoning invalid paths early. Used for puzzles, permutations, combinations.', teachingContent: 'Build solution incrementally. If invalid, backtrack (undo last choice) and try next option.', xpReward: 260, challengeType: 'interactive', difficulty: 'advanced', unlocked: false, completed: false, currentStage: 'narrative', videoTopic: 'Backtracking algorithm and applications', quizQuestions: [{id: 'dsa-17-q1', question: 'When does backtracking abandon a path?', options: ['When solution is found', 'When path becomes invalid', 'After fixed iterations', 'Never'], correctAnswer: 'When path becomes invalid', explanation: 'Backtracking abandons paths that cannot lead to valid solutions.', type: 'multiple-choice'}], codingProblems: [{id: 'dsa-17-p1', title: 'Generate Permutations', description: 'Generate all permutations of an array.', difficulty: 'medium', starterCode: 'function permute(nums) {\n  // Return all permutations\n  \n}', solution: 'function permute(nums) {\n  const result = [];\n  function backtrack(curr) {\n    if (curr.length === nums.length) {\n      result.push([...curr]);\n      return;\n    }\n    for (let num of nums) {\n      if (!curr.includes(num)) {\n        curr.push(num);\n        backtrack(curr);\n        curr.pop();\n      }\n    }\n  }\n  backtrack([]);\n  return result;\n}', functionName: 'permute', testCases: [{id: 't1', input: '[[1,2]]', expectedOutput: '[[1,2],[2,1]]'}], hints: ['Try each number', 'Backtrack by removing last choice'], tags: ['backtracking']}], externalResources: [{title: 'Permutations - LeetCode', url: 'https://leetcode.com/problems/permutations/', type: 'leetcode', difficulty: 'medium'}, {title: 'Backtracking - NeetCode', url: 'https://neetcode.io/roadmap', type: 'neetcode'}], gameConfig: {id: 'backtracking-puzzle-17', type: 'backtracking-puzzle', title: 'Backtracking Labyrinth', description: 'Find paths through trial and error', objective: 'Explore all possibilities', controls: 'Arrow Keys', passingScore: 85}},
      {id: 'dsa-18', courseId: 'dsa', title: 'Dynamic Programming - Basics', description: 'Optimization using memoization', story: 'Unlock the DP Dimension where remembering saves time.', narrative: 'DP solves optimization problems by storing subproblem solutions. Avoid redundant calculations.', teachingContent: 'Two approaches: top-down (memoization) and bottom-up (tabulation). Identify overlapping subproblems and optimal substructure.', xpReward: 270, challengeType: 'interactive', difficulty: 'advanced', unlocked: false, completed: false, currentStage: 'narrative', videoTopic: 'Dynamic programming introduction and memoization', quizQuestions: [{id: 'dsa-18-q1', question: 'What does memoization store?', options: ['Function calls', 'Subproblem results', 'Loop iterations', 'Variable names'], correctAnswer: 'Subproblem results', explanation: 'Memoization caches results of expensive function calls.', type: 'multiple-choice'}], codingProblems: [{id: 'dsa-18-p1', title: 'Climbing Stairs', description: 'Count ways to climb n stairs (1 or 2 steps at a time).', difficulty: 'easy', starterCode: 'function climbStairs(n) {\n  // Write your code here\n  \n}', solution: 'function climbStairs(n) {\n  if (n <= 2) return n;\n  const dp = [0, 1, 2];\n  for (let i = 3; i <= n; i++) {\n    dp[i] = dp[i-1] + dp[i-2];\n  }\n  return dp[n];\n}', functionName: 'climbStairs', testCases: [{id: 't1', input: '3', expectedOutput: '3'}, {id: 't2', input: '5', expectedOutput: '8'}], hints: ['Similar to Fibonacci', 'dp[n] = dp[n-1] + dp[n-2]'], tags: ['dp']}], externalResources: [{title: 'Climbing Stairs - LeetCode', url: 'https://leetcode.com/problems/climbing-stairs/', type: 'leetcode', difficulty: 'easy'}, {title: 'Dynamic Programming - NeetCode', url: 'https://neetcode.io/roadmap', type: 'neetcode'}], gameConfig: {id: 'pattern-builder-18', type: 'pattern-builder', title: 'DP Dimension', description: 'Optimize using memoization', objective: 'Solve problems efficiently with DP', controls: 'Click to compute', passingScore: 85}},
      {id: 'dsa-19', courseId: 'dsa', title: 'Greedy Algorithms', description: 'Making locally optimal choices', story: 'Join the Greedy Guild where best now means best overall.', narrative: 'Greedy algorithms make locally optimal choices hoping for global optimum. Works when local optimal leads to global optimal.', teachingContent: 'Greedy choice property: local optimum leads to global optimum. Used in Huffman coding, Dijkstra\'s, interval scheduling.', xpReward: 280, challengeType: 'interactive', difficulty: 'advanced', unlocked: false, completed: false, currentStage: 'narrative', videoTopic: 'Greedy algorithms and optimization strategies', quizQuestions: [{id: 'dsa-19-q1', question: 'What does greedy algorithm do at each step?', options: ['Explores all options', 'Makes locally optimal choice', 'Uses memoization', 'Backtracks'], correctAnswer: 'Makes locally optimal choice', explanation: 'Greedy algorithms choose best immediate option without reconsidering.', type: 'multiple-choice'}], codingProblems: [{id: 'dsa-19-p1', title: 'Jump Game', description: 'Can you reach the last index by jumping?', difficulty: 'medium', starterCode: 'function canJump(nums) {\n  // Write your code here\n  \n}', solution: 'function canJump(nums) {\n  let maxReach = 0;\n  for (let i = 0; i < nums.length; i++) {\n    if (i > maxReach) return false;\n    maxReach = Math.max(maxReach, i + nums[i]);\n  }\n  return true;\n}', functionName: 'canJump', testCases: [{id: 't1', input: '[[2,3,1,1,4]]', expectedOutput: 'true'}, {id: 't2', input: '[[3,2,1,0,4]]', expectedOutput: 'false'}], hints: ['Track maximum reachable index', 'Update as you iterate'], tags: ['greedy']}], externalResources: [{title: 'Jump Game - LeetCode', url: 'https://leetcode.com/problems/jump-game/', type: 'leetcode', difficulty: 'medium'}, {title: 'Greedy - NeetCode', url: 'https://neetcode.io/roadmap', type: 'neetcode'}], gameConfig: {id: 'search-challenge-19', type: 'search-challenge', title: 'Greedy Guild', description: 'Make optimal local choices', objective: 'Optimize using greedy strategy', controls: 'Click to choose', passingScore: 85}},
      {id: 'dsa-20', courseId: 'dsa', title: 'Advanced Topics', description: 'Tries, segment trees, and beyond', story: 'Reach the Masters Summit with the most complex structures.', narrative: 'Advanced data structures for specialized problems: tries for strings, segment trees for range queries, union-find for connectivity.', teachingContent: 'Trie: prefix tree for string operations. Segment tree: efficient range queries. Union-find: track connected components.', xpReward: 300, challengeType: 'interactive', difficulty: 'expert', unlocked: false, completed: false, currentStage: 'narrative', videoTopic: 'Advanced data structures: tries, segment trees, union-find', quizQuestions: [{id: 'dsa-20-q1', question: 'What is a trie optimized for?', options: ['Numeric operations', 'String prefix operations', 'Graph traversal', 'Sorting'], correctAnswer: 'String prefix operations', explanation: 'Tries excel at prefix matching and autocomplete features.', type: 'multiple-choice'}], codingProblems: [{id: 'dsa-20-p1', title: 'Implement Trie', description: 'Implement a trie with insert, search, and startsWith.', difficulty: 'medium', starterCode: 'class Trie {\n  constructor() {\n    // Initialize\n  }\n  insert(word) {}\n  search(word) {}\n  startsWith(prefix) {}\n}', solution: 'class Trie {\n  constructor() {\n    this.root = {};\n  }\n  insert(word) {\n    let node = this.root;\n    for (let char of word) {\n      if (!node[char]) node[char] = {};\n      node = node[char];\n    }\n    node.isEnd = true;\n  }\n  search(word) {\n    let node = this.root;\n    for (let char of word) {\n      if (!node[char]) return false;\n      node = node[char];\n    }\n    return !!node.isEnd;\n  }\n  startsWith(prefix) {\n    let node = this.root;\n    for (let char of prefix) {\n      if (!node[char]) return false;\n      node = node[char];\n    }\n    return true;\n  }\n}', functionName: 'Trie', testCases: [{id: 't1', input: '["insert","apple","search","apple"]', expectedOutput: 'true'}], hints: ['Use nested objects to represent trie', 'Mark end of words with a flag'], tags: ['trie', 'string']}], externalResources: [{title: 'Implement Trie - LeetCode', url: 'https://leetcode.com/problems/implement-trie-prefix-tree/', type: 'leetcode', difficulty: 'medium'}, {title: 'Advanced Topics - NeetCode', url: 'https://neetcode.io/roadmap', type: 'neetcode'}], gameConfig: {id: 'pattern-builder-20', type: 'pattern-builder', title: 'Masters Summit', description: 'Master advanced data structures', objective: 'Solve complex problems', controls: 'Click to build structures', passingScore: 90}},
    ]
  },
  {
    id: 'webdev',
    name: 'Web Development',
    description: 'Build the Matrix - Your AI Gamified Full Stack Journey',
    icon: '🌐',
    color: '#8b5cf6',
    levels: [
      {
        id: 'web-1',
        courseId: 'webdev',
        title: 'Enter the Matrix (HTML Basics)',
        description: 'Build the world using HTML blocks',
        story: 'You awaken in the Matrix — the world is blank; you must build it.',
        narrative: 'The Matrix world needs structure. Every website begins with HTML - the skeleton that holds everything together. You will learn to create headings, paragraphs, links, images, lists, tables, and semantic tags that give meaning to your content.',
        teachingContent: 'HTML (HyperText Markup Language) is the foundation of all web pages. Think of it as the blueprint of a building - it defines what goes where. Tags like <h1>, <p>, <img>, and <a> are your building blocks.',
        xpReward: 150,
        challengeType: 'interactive',
        difficulty: 'beginner',
        unlocked: true,
        completed: false,
        currentStage: 'narrative',
        quizPassScore: 70,
        gameConfig: {
          id: 'markup-forge-1',
          type: 'markup-forge',
          title: 'The Builder\'s Origin',
          description: 'Construct the digital city using HTML blocks',
          objective: 'Build structures by placing correct HTML elements',
          controls: 'Click to place elements, WASD to move',
          passingScore: 80,
          importanceWhy: 'This game teaches you how HTML elements work together to create structure. Just like building blocks, each HTML tag has a specific purpose. Understanding this foundation is crucial because every website you\'ll ever build starts with HTML structure.'
        },
        videoTopic: 'HTML basics and semantic HTML tutorial',
        aiSuggestedVideos: [
          {
            id: 'web1-v1',
            title: 'HTML Crash Course For Absolute Beginners',
            channelTitle: 'Traversy Media',
            thumbnailUrl: 'https://i.ytimg.com/vi/UB1O30fR-EE/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=UB1O30fR-EE'
          },
          {
            id: 'web1-v2',
            title: 'Learn HTML5 and CSS3 From Scratch',
            channelTitle: 'Programming with Mosh',
            thumbnailUrl: 'https://i.ytimg.com/vi/qz0aGYrrlhU/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=qz0aGYrrlhU'
          },
          {
            id: 'web1-v3',
            title: 'Semantic HTML - Why It Matters',
            channelTitle: 'Kevin Powell',
            thumbnailUrl: 'https://i.ytimg.com/vi/kGW8Al_cga4/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=kGW8Al_cga4'
          }
        ],
        quizQuestions: [
          {
            id: 'web-1-q1',
            question: 'What does HTML stand for?',
            options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'],
            correctAnswer: 'Hyper Text Markup Language',
            explanation: 'HTML stands for HyperText Markup Language, the standard markup language for web pages.',
            type: 'multiple-choice'
          },
          {
            id: 'web-1-q2',
            question: 'Which tag is used to create a hyperlink?',
            options: ['<link>', '<a>', '<href>', '<url>'],
            correctAnswer: '<a>',
            explanation: 'The <a> (anchor) tag is used to create hyperlinks in HTML.',
            type: 'multiple-choice'
          },
          {
            id: 'web-1-q3',
            question: 'What is the purpose of semantic HTML?',
            options: ['To make pages load faster', 'To give meaning to the structure', 'To add colors and styles', 'To make code shorter'],
            correctAnswer: 'To give meaning to the structure',
            explanation: 'Semantic HTML uses tags like <header>, <nav>, <article> to give meaning to content structure, improving accessibility and SEO.',
            type: 'multiple-choice'
          }
        ],
        codingProblems: [
          {
            id: 'web-1-p1',
            title: 'Create a Profile Card',
            description: 'Write HTML code to create a simple profile card with a heading (h1), paragraph (p), and image (img).',
            difficulty: 'easy',
            starterCode: 'function createProfile(name, bio, imageUrl) {\n  // Return HTML string\n  \n}',
            solution: 'function createProfile(name, bio, imageUrl) {\n  return `<div>\n    <h1>${name}</h1>\n    <img src="${imageUrl}" alt="${name}">\n    <p>${bio}</p>\n  </div>`;\n}',
            functionName: 'createProfile',
            testCases: [
              { id: 't1', input: '["John Doe", "Web Developer", "photo.jpg"]', expectedOutput: '"<div>\\n    <h1>John Doe</h1>\\n    <img src=\\"photo.jpg\\" alt=\\"John Doe\\">\\n    <p>Web Developer</p>\\n  </div>"', isHidden: false },
              { id: 't2', input: '["Jane", "Designer", "avatar.png"]', expectedOutput: '"<div>\\n    <h1>Jane</h1>\\n    <img src=\\"avatar.png\\" alt=\\"Jane\\">\\n    <p>Designer</p>\\n  </div>"', isHidden: false }
            ],
            hints: [
              'Use template literals to build the HTML string',
              'Include h1 for name, img for image, and p for bio',
              'Remember to use proper HTML structure with opening and closing tags'
            ],
            tags: ['html', 'basics', 'web-development']
          }
        ],
        externalResources: [
          {
            title: 'Two Sum - LeetCode',
            url: 'https://leetcode.com/problems/two-sum/',
            type: 'leetcode',
            difficulty: 'easy',
            description: 'Classic array problem - great for beginners'
          },
          {
            title: 'Valid Parentheses - LeetCode',
            url: 'https://leetcode.com/problems/valid-parentheses/',
            type: 'leetcode',
            difficulty: 'easy',
            description: 'Stack-based string validation problem'
          },
          {
            title: 'Palindrome Number - LeetCode',
            url: 'https://leetcode.com/problems/palindrome-number/',
            type: 'leetcode',
            difficulty: 'easy',
            description: 'Number manipulation and logic'
          },
          {
            title: 'Roman to Integer - LeetCode',
            url: 'https://leetcode.com/problems/roman-to-integer/',
            type: 'leetcode',
            difficulty: 'easy',
            description: 'String processing and mapping'
          },
          {
            title: 'Longest Common Prefix - LeetCode',
            url: 'https://leetcode.com/problems/longest-common-prefix/',
            type: 'leetcode',
            difficulty: 'easy',
            description: 'String comparison and iteration'
          }
        ]
      },
      {
        id: 'web-2',
        courseId: 'webdev',
        title: 'The Stylist\'s Realm (CSS)',
        description: 'Color the Matrix with CSS styling',
        story: 'You\'ve built the structure, now bring color and beauty to the Matrix.',
        narrative: 'The Matrix city exists but it\'s gray and lifeless. CSS (Cascading Style Sheets) is your tool to paint this world - colors, layouts, animations, and responsive designs that adapt to any screen.',
        teachingContent: 'CSS controls how HTML elements look. Selectors target elements, properties define styles. The box model (margin, padding, border) controls spacing. Flexbox and Grid create layouts. Animations bring life to static pages.',
        xpReward: 180,
        challengeType: 'interactive',
        difficulty: 'beginner',
        unlocked: true,
        completed: false,
        currentStage: 'narrative',
        quizPassScore: 75,
        videoTopic: 'CSS fundamentals: selectors, box model, flexbox, and grid',
        aiSuggestedVideos: [
          {
            id: 'web2-v1',
            title: 'CSS Crash Course For Absolute Beginners',
            channelTitle: 'Traversy Media',
            thumbnailUrl: 'https://i.ytimg.com/vi/yfoY53QXEnI/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=yfoY53QXEnI'
          },
          {
            id: 'web2-v2',
            title: 'Learn CSS Flexbox in 20 Minutes',
            channelTitle: 'Web Dev Simplified',
            thumbnailUrl: 'https://i.ytimg.com/vi/FTlczfR82mQ/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=FTlczfR82mQ'
          },
          {
            id: 'web2-v3',
            title: 'CSS Grid Layout Crash Course',
            channelTitle: 'Traversy Media',
            thumbnailUrl: 'https://i.ytimg.com/vi/jV8B24rSN5o/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=jV8B24rSN5o'
          }
        ],
        quizQuestions: [
          {
            id: 'web-2-q1',
            question: 'What does CSS stand for?',
            options: ['Cascading Style Sheets', 'Creative Style System', 'Computer Style Syntax', 'Colorful Style Sheets'],
            correctAnswer: 'Cascading Style Sheets',
            explanation: 'CSS stands for Cascading Style Sheets, used to style HTML elements.',
            type: 'multiple-choice'
          },
          {
            id: 'web-2-q2',
            question: 'Which CSS property controls the space between an element\'s content and its border?',
            options: ['margin', 'padding', 'border', 'spacing'],
            correctAnswer: 'padding',
            explanation: 'Padding creates space between content and border. Margin is outside the border.',
            type: 'multiple-choice'
          }
        ],
        codingProblems: [
          {
            id: 'web-2-p1',
            title: 'Generate CSS Styles',
            description: 'Write a function that generates CSS styling for a card component with background color, padding, and border radius.',
            difficulty: 'easy',
            starterCode: 'function generateCardCSS(bgColor, padding, borderRadius) {\n  // Return CSS string\n  \n}',
            solution: 'function generateCardCSS(bgColor, padding, borderRadius) {\n  return `.card {\n  background-color: ${bgColor};\n  padding: ${padding}px;\n  border-radius: ${borderRadius}px;\n}`;\n}',
            functionName: 'generateCardCSS',
            testCases: [
              { id: 't1', input: '["#fff", 20, 8]', expectedOutput: '".card {\\n  background-color: #fff;\\n  padding: 20px;\\n  border-radius: 8px;\\n}"', isHidden: false }
            ],
            hints: ['Use template literals to build the CSS string', 'Include property names and values with proper syntax'],
            tags: ['css', 'styling']
          }
        ],
        externalResources: [
          {
            title: 'Best Time to Buy and Sell Stock - LeetCode',
            url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
            type: 'leetcode',
            difficulty: 'easy',
            description: 'Array manipulation and profit calculation'
          },
          {
            title: 'Maximum Subarray - LeetCode',
            url: 'https://leetcode.com/problems/maximum-subarray/',
            type: 'leetcode',
            difficulty: 'medium',
            description: 'Dynamic programming classic problem'
          },
          {
            title: 'Merge Two Sorted Lists - LeetCode',
            url: 'https://leetcode.com/problems/merge-two-sorted-lists/',
            type: 'leetcode',
            difficulty: 'easy',
            description: 'Linked list merging algorithm'
          },
          {
            title: 'Valid Anagram - LeetCode',
            url: 'https://leetcode.com/problems/valid-anagram/',
            type: 'leetcode',
            difficulty: 'easy',
            description: 'String manipulation and sorting'
          }
        ],
        gameConfig: {
          id: 'style-spectrum-2',
          type: 'style-spectrum',
          title: 'Design the City',
          description: 'Transform the grayscale city with CSS styling',
          objective: 'Apply correct styles to restore color and layout',
          controls: 'Select elements and apply CSS properties',
          passingScore: 85,
          importanceWhy: 'Styling is what separates amateur websites from professional ones. This game shows you how CSS properties work together - colors, layouts, spacing, and responsive design. Mastering CSS means you can bring any design vision to life.'
        }
      },
      {
        id: 'web-3',
        courseId: 'webdev',
        title: 'The Logic Chamber (JavaScript)',
        description: 'Give life to the Matrix with JavaScript logic',
        story: 'The city is beautiful but static. JavaScript brings intelligence and interactivity.',
        narrative: 'Now the Matrix needs a brain. JavaScript makes websites interactive - responding to clicks, processing data, updating content dynamically. You\'ll learn variables, functions, loops, events, and how to manipulate the DOM.',
        teachingContent: 'JavaScript is the programming language of the web. Variables store data, functions perform actions, loops repeat tasks, and events respond to user interactions. The DOM (Document Object Model) lets you change HTML and CSS on the fly.',
        xpReward: 220,
        challengeType: 'interactive',
        difficulty: 'intermediate',
        unlocked: true,
        completed: false,
        currentStage: 'narrative',
        quizPassScore: 75,
        videoTopic: 'JavaScript fundamentals: variables, functions, DOM manipulation',
        quizQuestions: [
          {
            id: 'web-3-q1',
            question: 'What does DOM stand for?',
            options: ['Document Object Model', 'Data Object Management', 'Digital Output Module', 'Document Oriented Markup'],
            correctAnswer: 'Document Object Model',
            explanation: 'DOM represents the HTML document as a tree structure that JavaScript can manipulate.',
            type: 'multiple-choice'
          },
          {
            id: 'web-3-q2',
            question: 'Which method adds an event listener to an HTML element?',
            options: ['addEventListener', 'attachEvent', 'onClick', 'bindEvent'],
            correctAnswer: 'addEventListener',
            explanation: 'addEventListener is the standard method to attach event handlers to elements.',
            type: 'multiple-choice'
          }
        ],
        codingProblems: [
          {
            id: 'web-3-p1',
            title: 'Toggle Class',
            description: 'Write a function that toggles a CSS class on an element (returns new class list as string).',
            difficulty: 'easy',
            starterCode: 'function toggleClass(currentClasses, toggleClass) {\n  // currentClasses is string like "btn active"\n  // Return new classes after toggle\n  \n}',
            solution: 'function toggleClass(currentClasses, toggleClass) {\n  const classes = currentClasses.split(" ").filter(c => c);\n  const index = classes.indexOf(toggleClass);\n  if (index > -1) classes.splice(index, 1);\n  else classes.push(toggleClass);\n  return classes.join(" ");\n}',
            functionName: 'toggleClass',
            testCases: [
              { id: 't1', input: '["btn", "active"]', expectedOutput: '"btn active"', isHidden: false },
              { id: 't2', input: '["btn active", "active"]', expectedOutput: '"btn"', isHidden: false }
            ],
            hints: ['Split the class string into an array', 'Check if the class exists, add or remove accordingly'],
            tags: ['javascript', 'dom']
          }
        ],
        externalResources: [
          {
            title: 'JavaScript Guide - MDN',
            url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
            type: 'documentation',
            description: 'Comprehensive JavaScript guide'
          },
          {
            title: 'JavaScript30 - Free Course',
            url: 'https://javascript30.com/',
            type: 'article',
            description: '30 Day Vanilla JS Coding Challenge'
          }
        ],
        gameConfig: {
          id: 'script-circuit-3',
          type: 'script-circuit',
          title: 'The Code Core',
          description: 'Fix broken bots using JavaScript commands',
          objective: 'Write JavaScript logic to activate circuit nodes',
          controls: 'Type code, click to execute',
          passingScore: 80,
          importanceWhy: 'JavaScript is where web development becomes powerful. This game demonstrates core programming concepts - variables, functions, loops - in a visual way. Every interactive feature you\'ve ever used on a website uses JavaScript.'
        }
      },
      {
        id: 'web-4',
        courseId: 'webdev',
        title: 'The Portal of Components (React.js)',
        description: 'Master component-based architecture',
        story: 'You can now manipulate the Matrix using reusable components.',
        narrative: 'Building complex interfaces one element at a time is inefficient. React teaches you to think in components - reusable, composable pieces that manage their own state and can be combined to build sophisticated applications.',
        teachingContent: 'React is a JavaScript library for building user interfaces. Components are like custom HTML tags you create. Props pass data down, State manages data within. Hooks like useState and useEffect add functionality. React makes complex UIs manageable.',
        xpReward: 280,
        challengeType: 'interactive',
        difficulty: 'intermediate',
        unlocked: true,
        completed: false,
        currentStage: 'narrative',
        quizPassScore: 80,
        videoTopic: 'React fundamentals: components, props, state, and hooks',
        quizQuestions: [
          {
            id: 'web-4-q1',
            question: 'What is the correct way to pass data to a child component in React?',
            options: ['Props', 'State', 'Context', 'Refs'],
            correctAnswer: 'Props',
            explanation: 'Props (properties) are used to pass data from parent to child components.',
            type: 'multiple-choice'
          },
          {
            id: 'web-4-q2',
            question: 'Which hook is used to manage component state in React?',
            options: ['useState', 'useEffect', 'useContext', 'useRef'],
            correctAnswer: 'useState',
            explanation: 'useState hook allows functional components to have state.',
            type: 'multiple-choice'
          }
        ],
        codingProblems: [
          {
            id: 'web-4-p1',
            title: 'Create React Component String',
            description: 'Write a function that generates a simple React component string with given name and props.',
            difficulty: 'medium',
            starterCode: 'function createComponent(name, propsObj) {\n  // Return JSX-like string\n  \n}',
            solution: 'function createComponent(name, propsObj) {\n  const props = Object.entries(propsObj).map(([k,v]) => `${k}="${v}"`).join(" ");\n  return `<${name} ${props} />`;\n}',
            functionName: 'createComponent',
            testCases: [
              { id: 't1', input: '["Button", {"color": "blue", "size": "large"}]', expectedOutput: '"<Button color=\\"blue\\" size=\\"large\\" />"', isHidden: false }
            ],
            hints: ['Convert props object to key="value" format', 'Combine into JSX-like syntax'],
            tags: ['react', 'jsx']
          }
        ],
        externalResources: [
          {
            title: 'React Documentation',
            url: 'https://react.dev/',
            type: 'documentation',
            description: 'Official React documentation'
          },
          {
            title: 'React Tutorial - Scrimba',
            url: 'https://scrimba.com/learn/learnreact',
            type: 'article',
            description: 'Interactive React course'
          }
        ],
        gameConfig: {
          id: 'component-link-4',
          type: 'component-link',
          title: 'Build the Resistance Network',
          description: 'Create a dashboard by connecting React components',
          objective: 'Link components with correct props and state',
          controls: 'Drag to connect, click to configure',
          passingScore: 85,
          importanceWhy: 'React revolutionized web development by introducing component thinking. This game shows how components communicate through props, manage internal state, and compose into complex interfaces. Understanding this pattern is essential for modern web development.'
        }
      },
      {
        id: 'web-5',
        courseId: 'webdev',
        title: 'The Underworld of Servers (Node.js + Express)',
        description: 'Build the backend infrastructure',
        story: 'The Matrix backend is corrupted — rebuild it with server logic.',
        narrative: 'Every website needs a server - something that stores data, processes requests, and sends responses. Node.js lets you write server code in JavaScript. Express makes it easy to create APIs that your frontend can talk to.',
        teachingContent: 'Node.js runs JavaScript outside the browser. Express is a framework for building web servers. REST APIs use HTTP methods (GET, POST, PUT, DELETE) to perform operations. Routing directs requests, middleware processes them, and responses send data back.',
        xpReward: 320,
        challengeType: 'interactive',
        difficulty: 'advanced',
        unlocked: true,
        completed: false,
        currentStage: 'narrative',
        quizPassScore: 80,
        videoTopic: 'Node.js and Express: building REST APIs and server-side logic',
        quizQuestions: [
          {
            id: 'web-5-q1',
            question: 'What HTTP method is used to retrieve data from a server?',
            options: ['GET', 'POST', 'PUT', 'DELETE'],
            correctAnswer: 'GET',
            explanation: 'GET requests retrieve data without modifying it on the server.',
            type: 'multiple-choice'
          },
          {
            id: 'web-5-q2',
            question: 'What is middleware in Express.js?',
            options: ['Functions that process requests before reaching route handlers', 'Database connectors', 'Template engines', 'Error handlers only'],
            correctAnswer: 'Functions that process requests before reaching route handlers',
            explanation: 'Middleware functions have access to request, response, and can modify them or end the request-response cycle.',
            type: 'multiple-choice'
          }
        ],
        codingProblems: [
          {
            id: 'web-5-p1',
            title: 'Create API Route',
            description: 'Write a function that returns an API route definition object with method, path, and handler.',
            difficulty: 'medium',
            starterCode: 'function createRoute(method, path, data) {\n  // Return route object\n  \n}',
            solution: 'function createRoute(method, path, data) {\n  return { method, path, handler: () => data };\n}',
            functionName: 'createRoute',
            testCases: [
              { id: 't1', input: '["GET", "/api/users", {"users": []}]', expectedOutput: '{"method":"GET","path":"/api/users"}', isHidden: false }
            ],
            hints: ['Return an object with method, path, and handler properties', 'Handler should be a function returning data'],
            tags: ['nodejs', 'express', 'api']
          }
        ],
        externalResources: [
          {
            title: 'Express.js Guide',
            url: 'https://expressjs.com/en/guide/routing.html',
            type: 'documentation',
            description: 'Official Express routing guide'
          },
          {
            title: 'Node.js Best Practices',
            url: 'https://github.com/goldbergyoni/nodebestpractices',
            type: 'article',
            description: 'Comprehensive Node.js best practices'
          }
        ],
        gameConfig: {
          id: 'service-runner-5',
          type: 'service-runner',
          title: 'Server Reboot Protocol',
          description: 'Repair server nodes through API routing puzzles',
          objective: 'Connect routes to correct handlers and middleware',
          controls: 'Click to route requests, configure endpoints',
          passingScore: 85,
          importanceWhy: 'Backend development is where data lives. This game visualizes how HTTP requests flow through routes and middleware to endpoints. Understanding the server-side is crucial - without it, your frontend has nowhere to save or fetch data.'
        }
      },
      {
        id: 'web-6',
        courseId: 'webdev',
        title: 'The Memory Grid (Database)',
        description: 'Restore the world\'s data and memory',
        story: 'Data fragments are lost — restore the Matrix\'s memory with database operations.',
        narrative: 'Your application needs to remember things - user accounts, posts, settings. Databases store this information permanently. You\'ll learn about SQL vs NoSQL, creating schemas, relationships between data, and performing CRUD operations.',
        teachingContent: 'Databases persist data beyond page refreshes. SQL databases (PostgreSQL, MySQL) use structured tables with relationships. NoSQL databases (MongoDB) use flexible documents. Schemas define data structure. CRUD means Create, Read, Update, Delete - the four basic operations.',
        xpReward: 350,
        challengeType: 'interactive',
        difficulty: 'advanced',
        unlocked: true,
        completed: false,
        currentStage: 'narrative',
        quizPassScore: 80,
        videoTopic: 'SQL databases, schemas, and CRUD operations tutorial',
        quizQuestions: [
          {
            id: 'web-6-q1',
            question: 'What does CRUD stand for in database operations?',
            options: ['Create, Read, Update, Delete', 'Connect, Retrieve, Upload, Download', 'Copy, Run, Update, Delete', 'Create, Remove, Upload, Deploy'],
            correctAnswer: 'Create, Read, Update, Delete',
            explanation: 'CRUD represents the four basic operations for persistent storage.',
            type: 'multiple-choice'
          },
          {
            id: 'web-6-q2',
            question: 'What SQL command is used to retrieve data?',
            options: ['SELECT', 'GET', 'FETCH', 'RETRIEVE'],
            correctAnswer: 'SELECT',
            explanation: 'SELECT is the SQL command to query and retrieve data from database tables.',
            type: 'multiple-choice'
          }
        ],
        codingProblems: [
          {
            id: 'web-6-p1',
            title: 'Build SQL Query',
            description: 'Write a function that generates a SQL SELECT query for a given table and columns.',
            difficulty: 'easy',
            starterCode: 'function buildQuery(table, columns) {\n  // Return SQL query string\n  \n}',
            solution: 'function buildQuery(table, columns) {\n  return `SELECT ${columns.join(", ")} FROM ${table};`;\n}',
            functionName: 'buildQuery',
            testCases: [
              { id: 't1', input: '["users", ["id", "name", "email"]]', expectedOutput: '"SELECT id, name, email FROM users;"', isHidden: false }
            ],
            hints: ['Use SELECT keyword followed by column names', 'End with FROM table_name'],
            tags: ['sql', 'database']
          }
        ],
        externalResources: [
          {
            title: 'SQL Tutorial - W3Schools',
            url: 'https://www.w3schools.com/sql/',
            type: 'documentation',
            description: 'Interactive SQL tutorial'
          },
          {
            title: 'PostgreSQL Documentation',
            url: 'https://www.postgresql.org/docs/',
            type: 'documentation',
            description: 'Official PostgreSQL docs'
          }
        ],
        gameConfig: {
          id: 'data-bridge-6',
          type: 'data-bridge',
          title: 'Data Reconstruction',
          description: 'Collect and connect data shards into meaningful relationships',
          objective: 'Build database schema and establish relationships',
          controls: 'Drag tables, connect relationships',
          passingScore: 85,
          importanceWhy: 'Databases are the foundation of data-driven applications. This game shows how data relates - users have posts, posts have comments. Understanding relationships and schema design determines how well your application scales and performs.'
        }
      },
      {
        id: 'web-7',
        courseId: 'webdev',
        title: 'The Final Layer (Deployment & Integration)',
        description: 'Release your creation to the real world',
        story: 'It\'s time to release the Matrix to the world beyond.',
        narrative: 'You\'ve built a complete application - frontend, backend, and database. Now you need to deploy it so anyone can access it. Learn about environment variables, version control with Git, CI/CD pipelines, and deployment platforms.',
        teachingContent: 'Deployment means making your app accessible on the internet. Git tracks code changes. Environment variables store secrets securely. CI/CD automates testing and deployment. Platforms like Render, Vercel, and Replit host your application. HTTPS encrypts connections.',
        xpReward: 400,
        challengeType: 'interactive',
        difficulty: 'advanced',
        unlocked: true,
        completed: false,
        currentStage: 'narrative',
        quizPassScore: 85,
        gameConfig: {
          id: 'deploy-orbit-7',
          type: 'deploy-orbit',
          title: 'The Great Launch',
          description: 'Deploy your project and launch it to production',
          objective: 'Configure deployment pipeline and fix environment issues',
          controls: 'Click to configure, solve deployment puzzles',
          passingScore: 90,
          importanceWhy: 'Building something amazing means nothing if no one can use it. This game simulates real deployment challenges - environment variables, build errors, DNS configuration. Mastering deployment means you can ship your ideas to real users.'
        }
      }
    ]
  },
  {
    id: 'aiml',
    name: 'AI & Machine Learning',
    description: 'Explore artificial intelligence',
    icon: '🤖',
    color: '#ec4899',
    levels: [
      {
        id: 'ai-1',
        courseId: 'aiml',
        title: 'Introduction to AI',
        description: 'What is artificial intelligence?',
        story: 'Welcome to the AI Realm, where machines learn and evolve!',
        xpReward: 100,
        challengeType: 'quiz',
        difficulty: 'beginner',
        unlocked: true,
        completed: false,
      },
      {
        id: 'ai-2',
        courseId: 'aiml',
        title: 'Neural Networks',
        description: 'Understanding brain-inspired computing',
        story: 'Dive into the Neural Network Nexus and unlock the secrets of machine cognition.',
        xpReward: 150,
        challengeType: 'interactive',
        difficulty: 'intermediate',
        unlocked: false,
        completed: false,
      }
    ]
  },
  {
    id: 'cloud',
    name: 'MATRIX: Cloud & DevOps Odyssey',
    description: 'Forge the heavens. Command the clouds. Balance chaos and automation.',
    icon: '☁️',
    color: '#10b981',
    levels: [
      {
        id: 'cloud-1',
        courseId: 'cloud',
        title: 'The Genesis Cloud (Introduction to Cloud)',
        description: 'Rebuild order by understanding the essence of the Cloud',
        story: 'You awaken in the "Skyforge Realm" — a fragmented world where servers float in chaos. Your first task: rebuild order by understanding the essence of the Cloud.',
        narrative: 'Welcome to the Skyforge Realm, where compute, storage, and networking fragments drift in digital chaos. Your mission is to assemble these pieces into a functional cloud system. Learn the fundamental models of cloud computing and discover how virtualization enables the cloud revolution.',
        teachingContent: 'Cloud Computing delivers IT resources over the internet on-demand. Three service models exist: IaaS (Infrastructure as a Service - rent servers), PaaS (Platform as a Service - deploy without managing infrastructure), and SaaS (Software as a Service - ready-to-use apps). Deployment types include Public (AWS, Azure, GCP), Private (on-premises), and Hybrid (combination). Virtualization allows multiple virtual machines to run on one physical server.',
        xpReward: 150,
        challengeType: 'interactive',
        difficulty: 'beginner',
        unlocked: true,
        completed: false,
        currentStage: 'narrative',
        videoTopic: 'Cloud computing basics IaaS PaaS SaaS explained',
        aiSuggestedVideos: [
          {
            id: 'cloud1-v1',
            title: 'Cloud Computing In 6 Minutes | What Is Cloud Computing?',
            channelTitle: 'Simplilearn',
            thumbnailUrl: 'https://i.ytimg.com/vi/M988_fsOSWo/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=M988_fsOSWo'
          },
          {
            id: 'cloud1-v2',
            title: 'Cloud Computing Services Models - IaaS PaaS SaaS Explained',
            channelTitle: 'AWS',
            thumbnailUrl: 'https://i.ytimg.com/vi/36zducUX16w/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=36zducUX16w'
          },
          {
            id: 'cloud1-v3',
            title: 'AWS vs Azure vs GCP | Cloud Providers Comparison',
            channelTitle: 'TechWorld with Nana',
            thumbnailUrl: 'https://i.ytimg.com/vi/n24OBVGHufQ/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=n24OBVGHufQ'
          }
        ],
        quizQuestions: [
          {
            id: 'cloud-1-q1',
            question: 'Which cloud service model provides the most control over infrastructure?',
            options: ['SaaS', 'PaaS', 'IaaS', 'FaaS'],
            correctAnswer: 'IaaS',
            explanation: 'Infrastructure as a Service (IaaS) gives you the most control, allowing you to manage virtual machines, storage, and networks.',
            type: 'multiple-choice'
          },
          {
            id: 'cloud-1-q2',
            question: 'What does "on-demand" mean in cloud computing?',
            options: ['Resources are always running', 'Resources can be provisioned instantly when needed', 'Resources must be requested weeks in advance', 'Resources are free'],
            correctAnswer: 'Resources can be provisioned instantly when needed',
            explanation: 'On-demand means you can get computing resources immediately when you need them, without long procurement processes.',
            type: 'multiple-choice'
          },
          {
            id: 'cloud-1-q3',
            question: 'Which deployment model combines on-premises and public cloud?',
            options: ['Public Cloud', 'Private Cloud', 'Hybrid Cloud', 'Community Cloud'],
            correctAnswer: 'Hybrid Cloud',
            explanation: 'Hybrid Cloud combines private (on-premises) infrastructure with public cloud services for flexibility and data control.',
            type: 'multiple-choice'
          }
        ],
        codingProblems: [
          {
            id: 'cloud-1-p1',
            title: 'Cloud Service Classifier',
            description: 'Write a function that classifies cloud services into IaaS, PaaS, or SaaS categories.',
            difficulty: 'easy',
            starterCode: 'function classifyService(serviceName) {\n  // Return "IaaS", "PaaS", or "SaaS"\n  \n}',
            solution: 'function classifyService(serviceName) {\n  const iaas = ["EC2", "Virtual Machines", "Compute Engine"];\n  const paas = ["Heroku", "App Engine", "Azure App Service"];\n  const saas = ["Gmail", "Office 365", "Salesforce"];\n  \n  if (iaas.includes(serviceName)) return "IaaS";\n  if (paas.includes(serviceName)) return "PaaS";\n  if (saas.includes(serviceName)) return "SaaS";\n  return "Unknown";\n}',
            functionName: 'classifyService',
            testCases: [
              { id: 't1', input: '"EC2"', expectedOutput: '"IaaS"', isHidden: false },
              { id: 't2', input: '"Heroku"', expectedOutput: '"PaaS"', isHidden: false }
            ],
            hints: ['Create arrays for each service type', 'Check which array contains the service'],
            tags: ['cloud', 'classification']
          }
        ],
        externalResources: [
          {
            title: 'AWS Cloud Practitioner Learning Path',
            url: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
            type: 'documentation',
            description: 'Official AWS certification path for cloud basics'
          },
          {
            title: 'Azure Fundamentals',
            url: 'https://learn.microsoft.com/en-us/training/paths/az-900-describe-cloud-concepts/',
            type: 'documentation',
            description: 'Microsoft Azure cloud fundamentals course'
          },
          {
            title: 'Google Cloud Skills Boost',
            url: 'https://www.cloudskillsboost.google/',
            type: 'neetcode',
            difficulty: 'easy',
            description: 'Hands-on labs for GCP'
          }
        ],
        gameConfig: {
          id: 'component-link-cloud-1',
          type: 'component-link',
          title: 'Assemble the Cloud',
          description: 'Drag-and-drop cloud fragments to form a functional system',
          objective: 'Connect compute, storage, and networking correctly to stabilize the sky islands',
          controls: 'Drag and drop components to connect them',
          passingScore: 85,
          importanceWhy: 'Understanding cloud architecture fundamentals is essential for modern development. This game visualizes how compute, storage, and networking work together to create cloud services that power billions of applications worldwide.'
        }
      },
      {
        id: 'cloud-2',
        courseId: 'cloud',
        title: 'The Forge of Infrastructure (Networking & Compute)',
        description: 'Master the backbone — networks and compute engines',
        story: 'To command the Skyforge, you must master its backbone — networks and compute engines.',
        narrative: 'The Skyforge cannot function without proper networking. Learn how data flows between cloud islands through Virtual Private Clouds (VPCs), how load balancers distribute traffic, and how compute instances power applications. Every misconfiguration causes data storms!',
        teachingContent: 'Networking Fundamentals: IP addresses identify devices, DNS translates domain names to IPs, Load Balancers distribute traffic across servers. Compute Instances are virtual machines (EC2 in AWS, VM in Azure). Storage includes object storage (S3, Blob Storage) for files and block storage (EBS, Managed Disks) for databases. VPC creates isolated networks in the cloud with subnets, route tables, and security groups.',
        xpReward: 180,
        challengeType: 'interactive',
        difficulty: 'beginner',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        videoTopic: 'AWS VPC networking EC2 instances tutorial',
        aiSuggestedVideos: [
          {
            id: 'cloud2-v1',
            title: 'AWS VPC Beginner to Pro - Virtual Private Cloud Tutorial',
            channelTitle: 'freeCodeCamp',
            thumbnailUrl: 'https://i.ytimg.com/vi/g2JOHLHh4rI/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=g2JOHLHh4rI'
          },
          {
            id: 'cloud2-v2',
            title: 'AWS EC2 Tutorial For Beginners',
            channelTitle: 'Simplilearn',
            thumbnailUrl: 'https://i.ytimg.com/vi/8TlukLu11Yo/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=8TlukLu11Yo'
          },
          {
            id: 'cloud2-v3',
            title: 'S3 Bucket Tutorial | AWS Storage',
            channelTitle: 'Tech With Lucy',
            thumbnailUrl: 'https://i.ytimg.com/vi/e6w9LwZJFIA/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=e6w9LwZJFIA'
          }
        ],
        quizQuestions: [
          {
            id: 'cloud-2-q1',
            question: 'What is the purpose of a load balancer?',
            options: ['Store data', 'Distribute traffic across multiple servers', 'Translate domain names', 'Encrypt data'],
            correctAnswer: 'Distribute traffic across multiple servers',
            explanation: 'Load balancers distribute incoming traffic across multiple servers to ensure no single server gets overwhelmed, improving availability and reliability.',
            type: 'multiple-choice'
          },
          {
            id: 'cloud-2-q2',
            question: 'What does VPC stand for?',
            options: ['Virtual Private Cloud', 'Virtual Public Container', 'Very Private Computing', 'Virtual Platform Cloud'],
            correctAnswer: 'Virtual Private Cloud',
            explanation: 'VPC (Virtual Private Cloud) is an isolated network environment in the cloud where you can launch resources securely.',
            type: 'multiple-choice'
          },
          {
            id: 'cloud-2-q3',
            question: 'Which AWS service provides object storage?',
            options: ['EC2', 'S3', 'VPC', 'RDS'],
            correctAnswer: 'S3',
            explanation: 'Amazon S3 (Simple Storage Service) provides scalable object storage for files, images, videos, and backups.',
            type: 'multiple-choice'
          }
        ],
        externalResources: [
          {
            title: 'AWS VPC Documentation',
            url: 'https://docs.aws.amazon.com/vpc/',
            type: 'documentation',
            description: 'Complete VPC configuration guide'
          },
          {
            title: 'AWS EC2 Getting Started',
            url: 'https://aws.amazon.com/ec2/getting-started/',
            type: 'documentation',
            description: 'Launch your first EC2 instance'
          },
          {
            title: 'Networking Basics - A Cloud Guru',
            url: 'https://acloudguru.com/course/networking-basics',
            type: 'neetcode',
            difficulty: 'easy',
            description: 'Learn cloud networking fundamentals'
          }
        ],
        gameConfig: {
          id: 'data-bridge-cloud-2',
          type: 'data-bridge',
          title: 'Sky Network Builder',
          description: 'Create secure network routes between cloud islands',
          objective: 'Configure VPC, subnets, and routes correctly - wrong configurations cause data storms',
          controls: 'Click to configure network components',
          passingScore: 85,
          importanceWhy: 'Networking is the foundation of cloud infrastructure. Understanding VPCs, subnets, and routing prevents security vulnerabilities and ensures reliable communication between services. Every major cloud outage involves networking issues.'
        }
      },
      {
        id: 'cloud-3',
        courseId: 'cloud',
        title: 'The Chamber of Automation (DevOps Foundations)',
        description: 'Control the storm with scripts and automation',
        story: 'The Skyforge is too vast to manage manually. Enter the Chamber of Automation — where you learn to control the storm with scripts.',
        narrative: 'Manual deployment is chaos. Every time you click buttons to deploy, you risk human error. The Chamber of Automation teaches you to codify your processes, use version control to track changes, and build pipelines that deploy automatically. Welcome to DevOps!',
        teachingContent: 'DevOps unifies Development and Operations for faster, reliable delivery. CI/CD means Continuous Integration (automatically test code) and Continuous Deployment (automatically deploy to production). Git tracks code changes - commit saves snapshots, branches enable parallel work, pull requests review changes. GitHub/GitLab host Git repositories and run CI/CD pipelines. Automation eliminates manual errors and speeds deployment from weeks to minutes.',
        xpReward: 200,
        challengeType: 'interactive',
        difficulty: 'beginner',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        videoTopic: 'DevOps CI/CD pipeline Git GitHub Actions tutorial',
        aiSuggestedVideos: [
          {
            id: 'cloud3-v1',
            title: 'DevOps Explained in 100 Seconds',
            channelTitle: 'Fireship',
            thumbnailUrl: 'https://i.ytimg.com/vi/scEDHsr3APg/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=scEDHsr3APg'
          },
          {
            id: 'cloud3-v2',
            title: 'Git and GitHub for Beginners - Crash Course',
            channelTitle: 'freeCodeCamp',
            thumbnailUrl: 'https://i.ytimg.com/vi/RGOj5yH7evk/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=RGOj5yH7evk'
          },
          {
            id: 'cloud3-v3',
            title: 'CI/CD In 5 Minutes | What Is CI/CD?',
            channelTitle: 'Simplilearn',
            thumbnailUrl: 'https://i.ytimg.com/vi/42UP1fxi2SY/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=42UP1fxi2SY'
          }
        ],
        quizQuestions: [
          {
            id: 'cloud-3-q1',
            question: 'What does CI/CD stand for?',
            options: ['Code Integration/Code Deployment', 'Continuous Integration/Continuous Deployment', 'Cloud Infrastructure/Cloud Development', 'Container Integration/Container Delivery'],
            correctAnswer: 'Continuous Integration/Continuous Deployment',
            explanation: 'CI/CD automates testing (Continuous Integration) and deployment (Continuous Deployment) to deliver code changes faster and more reliably.',
            type: 'multiple-choice'
          },
          {
            id: 'cloud-3-q2',
            question: 'What is the main benefit of DevOps?',
            options: ['Cheaper servers', 'Faster and more reliable software delivery', 'Eliminating testing', 'Reducing team size'],
            correctAnswer: 'Faster and more reliable software delivery',
            explanation: 'DevOps bridges development and operations to deliver features faster while maintaining stability through automation and collaboration.',
            type: 'multiple-choice'
          },
          {
            id: 'cloud-3-q3',
            question: 'What Git command saves your changes?',
            options: ['git push', 'git commit', 'git save', 'git deploy'],
            correctAnswer: 'git commit',
            explanation: 'git commit creates a snapshot of your changes in the Git history. git push then uploads commits to a remote repository.',
            type: 'multiple-choice'
          }
        ],
        externalResources: [
          {
            title: 'GitHub Skills - Introduction to GitHub',
            url: 'https://skills.github.com/',
            type: 'documentation',
            description: 'Interactive GitHub learning labs'
          },
          {
            title: 'GitLab CI/CD Documentation',
            url: 'https://docs.gitlab.com/ee/ci/',
            type: 'documentation',
            description: 'Build your first pipeline'
          },
          {
            title: 'DevOps Roadmap',
            url: 'https://roadmap.sh/devops',
            type: 'neetcode',
            difficulty: 'easy',
            description: 'Complete DevOps learning path'
          }
        ],
        gameConfig: {
          id: 'script-circuit-cloud-3',
          type: 'script-circuit',
          title: 'Automation Forge',
          description: 'Build an automated pipeline that forges artifacts from code commits',
          objective: 'Connect CI/CD stages correctly - mistakes cause build failures',
          controls: 'Click to configure pipeline stages',
          passingScore: 85,
          importanceWhy: 'Automation is the heart of modern software delivery. Manual deployments cause errors, take hours, and don\'t scale. Learning CI/CD means you can ship features daily instead of monthly, with confidence they won\'t break production.'
        }
      },
      {
        id: 'cloud-4',
        courseId: 'cloud',
        title: 'The Terraform Plains (Infrastructure as Code)',
        description: 'Summon infrastructure with code',
        story: 'You now enter the realm where infrastructure is summoned by code. Terraform is your spellbook.',
        narrative: 'Clicking buttons in AWS/Azure consoles is slow and error-prone. The Terraform Plains teach you to describe infrastructure in code files. With one command, you can create entire cloud environments. Change one line to add 10 servers. Infrastructure as Code is the foundation of modern cloud operations.',
        teachingContent: 'Infrastructure as Code (IaC) means managing infrastructure with configuration files instead of manual processes. Terraform is a popular IaC tool supporting AWS, Azure, GCP, and 300+ providers. Key concepts: Providers (cloud platforms), Resources (things you create like VMs, databases), State (tracking what exists), Modules (reusable components). Terraform workflow: Write .tf files → terraform init (setup) → terraform plan (preview) → terraform apply (create).',
        xpReward: 220,
        challengeType: 'interactive',
        difficulty: 'intermediate',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        videoTopic: 'Terraform tutorial infrastructure as code AWS',
        aiSuggestedVideos: [
          {
            id: 'cloud4-v1',
            title: 'Terraform in 100 Seconds',
            channelTitle: 'Fireship',
            thumbnailUrl: 'https://i.ytimg.com/vi/tomUWcQ0P3k/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=tomUWcQ0P3k'
          },
          {
            id: 'cloud4-v2',
            title: 'Terraform Course - Automate your AWS cloud infrastructure',
            channelTitle: 'freeCodeCamp',
            thumbnailUrl: 'https://i.ytimg.com/vi/SLB_c_ayRMo/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=SLB_c_ayRMo'
          },
          {
            id: 'cloud4-v3',
            title: 'Complete Terraform Tutorial for Beginners',
            channelTitle: 'TechWorld with Nana',
            thumbnailUrl: 'https://i.ytimg.com/vi/l5k1ai_GBDE/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=l5k1ai_GBDE'
          }
        ],
        quizQuestions: [
          {
            id: 'cloud-4-q1',
            question: 'What is the main benefit of Infrastructure as Code?',
            options: ['Cheaper cloud bills', 'Reproducible, version-controlled infrastructure', 'Faster internet', 'Automatic security'],
            correctAnswer: 'Reproducible, version-controlled infrastructure',
            explanation: 'IaC lets you recreate identical environments, track changes in Git, and avoid manual configuration errors.',
            type: 'multiple-choice'
          },
          {
            id: 'cloud-4-q2',
            question: 'Which Terraform command creates infrastructure?',
            options: ['terraform create', 'terraform apply', 'terraform build', 'terraform deploy'],
            correctAnswer: 'terraform apply',
            explanation: 'terraform apply executes the planned changes and creates/modifies infrastructure.',
            type: 'multiple-choice'
          },
          {
            id: 'cloud-4-q3',
            question: 'What does Terraform state track?',
            options: ['Your code', 'What infrastructure currently exists', 'Billing information', 'User passwords'],
            correctAnswer: 'What infrastructure currently exists',
            explanation: 'Terraform state maps your configuration to real infrastructure, tracking what resources exist and their current configuration.',
            type: 'multiple-choice'
          }
        ],
        externalResources: [
          {
            title: 'Terraform AWS Provider Documentation',
            url: 'https://registry.terraform.io/providers/hashicorp/aws/latest/docs',
            type: 'documentation',
            description: 'Complete AWS Terraform reference'
          },
          {
            title: 'Learn Terraform - HashiCorp',
            url: 'https://learn.hashicorp.com/terraform',
            type: 'documentation',
            description: 'Official Terraform tutorials'
          },
          {
            title: 'Terraform Best Practices',
            url: 'https://www.terraform-best-practices.com/',
            type: 'neetcode',
            difficulty: 'medium',
            description: 'Production-ready Terraform patterns'
          }
        ],
        gameConfig: {
          id: 'pattern-builder-cloud-4',
          type: 'pattern-builder',
          title: 'Code the Cloud',
          description: 'Write Terraform-like commands to summon cloud resources',
          objective: 'Correct syntax builds towers; mistakes spawn resource errors',
          controls: 'Type commands to create infrastructure',
          passingScore: 85,
          importanceWhy: 'Infrastructure as Code is essential for scaling cloud operations. Companies managing hundreds of servers can\'t click buttons - they write code. Terraform skills let you build entire cloud environments in minutes and destroy them just as fast, saving thousands in cloud costs.'
        }
      },
      {
        id: 'cloud-5',
        courseId: 'cloud',
        title: 'The Docker Depths (Containerization)',
        description: 'Discover the secret of containers',
        story: 'You discover ancient chambers holding the secret of "containers" — self-contained life forms that can run anywhere.',
        narrative: 'The Docker Depths reveal why "it works on my machine" is never acceptable. Containers package your application with all dependencies - code, libraries, environment variables - into a portable unit that runs identically everywhere. No more dependency conflicts, no more environment mismatches.',
        teachingContent: 'Docker containers are lightweight, standalone packages containing everything needed to run software. Unlike virtual machines, containers share the host OS kernel (faster, less overhead). Key concepts: Images (blueprints), Containers (running instances), Dockerfile (build instructions), Volumes (persistent data), Networks (container communication). Docker workflow: Write Dockerfile → docker build (create image) → docker run (start container) → docker push (share on Docker Hub).',
        xpReward: 240,
        challengeType: 'interactive',
        difficulty: 'intermediate',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        videoTopic: 'Docker containers tutorial Dockerfile basics',
        aiSuggestedVideos: [
          {
            id: 'cloud5-v1',
            title: 'Docker in 100 Seconds',
            channelTitle: 'Fireship',
            thumbnailUrl: 'https://i.ytimg.com/vi/Gjnup-PuquQ/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=Gjnup-PuquQ'
          },
          {
            id: 'cloud5-v2',
            title: 'Docker Tutorial for Beginners - A Full DevOps Course',
            channelTitle: 'freeCodeCamp',
            thumbnailUrl: 'https://i.ytimg.com/vi/fqMOX6JJhGo/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=fqMOX6JJhGo'
          },
          {
            id: 'cloud5-v3',
            title: 'Docker Crash Course for Absolute Beginners',
            channelTitle: 'TechWorld with Nana',
            thumbnailUrl: 'https://i.ytimg.com/vi/pg19Z8LL06w/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=pg19Z8LL06w'
          }
        ],
        quizQuestions: [
          {
            id: 'cloud-5-q1',
            question: 'What is the main advantage of containers over virtual machines?',
            options: ['Containers are more secure', 'Containers are lighter and start faster', 'Containers cost less', 'Containers have better graphics'],
            correctAnswer: 'Containers are lighter and start faster',
            explanation: 'Containers share the host OS kernel, making them much lighter (MBs vs GBs) and faster to start (seconds vs minutes) than VMs.',
            type: 'multiple-choice'
          },
          {
            id: 'cloud-5-q2',
            question: 'What file defines how to build a Docker image?',
            options: ['docker.json', 'Dockerfile', 'container.yaml', 'image.txt'],
            correctAnswer: 'Dockerfile',
            explanation: 'Dockerfile contains instructions (FROM, RUN, COPY, CMD) that define how to build a Docker image.',
            type: 'multiple-choice'
          },
          {
            id: 'cloud-5-q3',
            question: 'Why do we need Docker volumes?',
            options: ['To make containers louder', 'To persist data when containers stop', 'To speed up containers', 'To connect to networks'],
            correctAnswer: 'To persist data when containers stop',
            explanation: 'Containers are ephemeral - data inside them disappears when they stop. Volumes persist data outside containers for databases and user files.',
            type: 'multiple-choice'
          }
        ],
        externalResources: [
          {
            title: 'Docker Documentation',
            url: 'https://docs.docker.com/get-started/',
            type: 'documentation',
            description: 'Official Docker getting started guide'
          },
          {
            title: 'Docker Hub',
            url: 'https://hub.docker.com/',
            type: 'documentation',
            description: 'Find and share container images'
          },
          {
            title: 'Play with Docker',
            url: 'https://labs.play-with-docker.com/',
            type: 'neetcode',
            difficulty: 'easy',
            description: 'Practice Docker in browser'
          }
        ],
        gameConfig: {
          id: 'component-link-cloud-5',
          type: 'component-link',
          title: 'Contain the Chaos',
          description: 'Containerize unstable microservices to prevent system meltdown',
          objective: 'Balance resources, dependencies, and versions correctly',
          controls: 'Configure containers and connect them',
          passingScore: 85,
          importanceWhy: 'Containerization solves the "works on my machine" problem forever. Every major tech company uses containers - from Netflix to Spotify. Understanding Docker means your applications run consistently from development to production, eliminating 90% of deployment bugs.'
        }
      },
      {
        id: 'cloud-6',
        courseId: 'cloud',
        title: 'The Kubernetes Peaks (Orchestration)',
        description: 'Balance pods and clusters atop cloud mountains',
        story: 'Atop the cloud mountains lies Kubernetes — the guardian of orchestration and scaling. Only those who can balance pods and clusters may pass.',
        narrative: 'Running one Docker container is easy. Running 1000 containers across 100 servers? That\'s chaos without orchestration. Kubernetes (K8s) automatically deploys, scales, and heals your containerized applications. Master it to command container armies.',
        teachingContent: 'Kubernetes orchestrates containers at scale. Architecture: Pods (smallest unit, one or more containers), Nodes (worker machines running pods), Clusters (set of nodes), Control Plane (manages cluster). Key resources: Deployments (manage replicas), Services (networking/load balancing), ConfigMaps/Secrets (configuration), Ingress (external access). Kubernetes provides self-healing (restarts failed pods), auto-scaling (adds pods under load), rolling updates (zero-downtime deploys). kubectl is the CLI tool.',
        xpReward: 280,
        challengeType: 'interactive',
        difficulty: 'intermediate',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        videoTopic: 'Kubernetes tutorial pods deployments services explained',
        aiSuggestedVideos: [
          {
            id: 'cloud6-v1',
            title: 'Kubernetes in 100 Seconds',
            channelTitle: 'Fireship',
            thumbnailUrl: 'https://i.ytimg.com/vi/PziYflu8cB8/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=PziYflu8cB8'
          },
          {
            id: 'cloud6-v2',
            title: 'Kubernetes Tutorial for Beginners [FULL COURSE in 4 Hours]',
            channelTitle: 'TechWorld with Nana',
            thumbnailUrl: 'https://i.ytimg.com/vi/X48VuDVv0do/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=X48VuDVv0do'
          },
          {
            id: 'cloud6-v3',
            title: 'Kubernetes Course - Full Beginners Tutorial',
            channelTitle: 'freeCodeCamp',
            thumbnailUrl: 'https://i.ytimg.com/vi/d6WC5n9G_sM/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=d6WC5n9G_sM'
          }
        ],
        quizQuestions: [
          {
            id: 'cloud-6-q1',
            question: 'What is a Kubernetes Pod?',
            options: ['A storage volume', 'The smallest deployable unit containing one or more containers', 'A type of server', 'A database'],
            correctAnswer: 'The smallest deployable unit containing one or more containers',
            explanation: 'A Pod is the basic execution unit in Kubernetes, containing one or more tightly coupled containers that share storage and network.',
            type: 'multiple-choice'
          },
          {
            id: 'cloud-6-q2',
            question: 'What does Kubernetes auto-scaling do?',
            options: ['Makes pods bigger', 'Automatically adjusts the number of pods based on load', 'Scales storage automatically', 'Upgrades Kubernetes versions'],
            correctAnswer: 'Automatically adjusts the number of pods based on load',
            explanation: 'Horizontal Pod Autoscaler automatically increases or decreases pod replicas based on CPU, memory, or custom metrics.',
            type: 'multiple-choice'
          },
          {
            id: 'cloud-6-q3',
            question: 'What Kubernetes resource exposes pods to network traffic?',
            options: ['Deployment', 'Service', 'Pod', 'Volume'],
            correctAnswer: 'Service',
            explanation: 'A Service provides stable networking and load balancing to a set of Pods, even as pods are created and destroyed.',
            type: 'multiple-choice'
          }
        ],
        externalResources: [
          {
            title: 'Kubernetes Documentation',
            url: 'https://kubernetes.io/docs/home/',
            type: 'documentation',
            description: 'Official Kubernetes docs'
          },
          {
            title: 'Kubernetes the Hard Way',
            url: 'https://github.com/kelseyhightower/kubernetes-the-hard-way',
            type: 'documentation',
            description: 'Learn K8s by building a cluster from scratch'
          },
          {
            title: 'Killercoda Kubernetes Labs',
            url: 'https://killercoda.com/kubernetes',
            type: 'neetcode',
            difficulty: 'medium',
            description: 'Interactive Kubernetes scenarios'
          }
        ],
        gameConfig: {
          id: 'pattern-builder-cloud-6',
          type: 'pattern-builder',
          title: 'Battle of Pods',
          description: 'Deploy and scale microservice armies to handle surging requests',
          objective: 'Too few pods = system crash; too many = wasted resources',
          controls: 'Scale deployments and configure services',
          passingScore: 85,
          importanceWhy: 'Kubernetes powers the infrastructure of companies like Google, Spotify, and Pinterest. Understanding K8s orchestration means you can deploy applications that automatically scale from 10 to 10,000 users without crashing or overspending on cloud resources.'
        }
      },
      {
        id: 'cloud-7',
        courseId: 'cloud',
        title: 'The CI/CD Citadel',
        description: 'Create unbroken pipelines sustaining the Skyforge',
        story: 'You ascend to the Citadel, where time and deployment flow continuously. Here you learn to create unbroken pipelines that sustain the Skyforge.',
        narrative: 'The CI/CD Citadel is where theory becomes practice. Build complete automated pipelines using Jenkins, GitHub Actions, or GitLab CI. Every code commit triggers tests, builds, and deployments automatically. Wrong stage order breaks everything - learn to architect bulletproof delivery pipelines.',
        teachingContent: 'CI/CD Pipelines automate the path from code to production. Pipeline stages: Source (pull code from Git) → Build (compile/package code) → Test (run automated tests) → Deploy (push to environments). Tools: Jenkins (self-hosted, flexible), GitHub Actions (integrated with GitHub), GitLab CI (integrated with GitLab), CircleCI (cloud-based). Concepts: Triggers (what starts pipeline), Stages (sequential steps), Jobs (parallel tasks), Artifacts (build outputs), Environments (dev, staging, production). Best practices: fail fast, parallel testing, deployment strategies (blue-green, canary).',
        xpReward: 300,
        challengeType: 'interactive',
        difficulty: 'advanced',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        videoTopic: 'CI/CD pipeline GitHub Actions Jenkins tutorial',
        aiSuggestedVideos: [
          {
            id: 'cloud7-v1',
            title: 'GitHub Actions Tutorial - From Zero to Hero',
            channelTitle: 'TechWorld with Nana',
            thumbnailUrl: 'https://i.ytimg.com/vi/R8_veQiYBjI/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=R8_veQiYBjI'
          },
          {
            id: 'cloud7-v2',
            title: 'Jenkins Tutorial - Full Course for Beginners',
            channelTitle: 'freeCodeCamp',
            thumbnailUrl: 'https://i.ytimg.com/vi/7KCS70sCoK0/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=7KCS70sCoK0'
          },
          {
            id: 'cloud7-v3',
            title: 'GitLab CI CD Tutorial for Beginners',
            channelTitle: 'TechWorld with Nana',
            thumbnailUrl: 'https://i.ytimg.com/vi/qP8kir2GUgo/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=qP8kir2GUgo'
          }
        ],
        quizQuestions: [
          {
            id: 'cloud-7-q1',
            question: 'What is the main goal of Continuous Deployment?',
            options: ['To deploy code manually', 'To automatically deploy every code change that passes tests', 'To deploy once a month', 'To avoid testing'],
            correctAnswer: 'To automatically deploy every code change that passes tests',
            explanation: 'Continuous Deployment automates the entire release process - code that passes all tests automatically goes to production without human intervention.',
            type: 'multiple-choice'
          },
          {
            id: 'cloud-7-q2',
            question: 'In a CI/CD pipeline, what should happen first?',
            options: ['Deploy', 'Test', 'Build', 'Source/Pull Code'],
            correctAnswer: 'Source/Pull Code',
            explanation: 'Pipelines always start by pulling the latest code from the repository, then build, test, and finally deploy.',
            type: 'multiple-choice'
          },
          {
            id: 'cloud-7-q3',
            question: 'What is a "build artifact"?',
            options: ['A bug in the code', 'The output of the build process (compiled code, packages)', 'A test result', 'A Git commit'],
            correctAnswer: 'The output of the build process (compiled code, packages)',
            explanation: 'Artifacts are the compiled binaries, Docker images, or packages produced by the build stage and deployed in later stages.',
            type: 'multiple-choice'
          }
        ],
        codingProblems: [
          {
            id: 'cloud-7-p1',
            title: 'Create GitHub Actions Workflow',
            description: 'Write a YAML configuration for a basic CI/CD pipeline that builds and tests a Node.js app.',
            difficulty: 'medium',
            starterCode: 'name: CI/CD Pipeline\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      # Add your steps here',
            solution: 'name: CI/CD Pipeline\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - uses: actions/setup-node@v3\n        with:\n          node-version: 18\n      - run: npm install\n      - run: npm test\n      - run: npm run build',
            functionName: 'workflow',
            testCases: [
              { id: 't1', input: 'workflow', expectedOutput: 'valid YAML with checkout, setup-node, install, test, build steps', isHidden: false }
            ],
            hints: ['Use actions/checkout@v3 to get code', 'Use actions/setup-node@v3 for Node.js', 'Run npm install, test, and build'],
            tags: ['ci-cd', 'github-actions', 'devops']
          }
        ],
        externalResources: [
          {
            title: 'Build a CI/CD Pipeline - GitHub Actions',
            url: 'https://github.com/skills/continuous-integration',
            type: 'leetcode',
            difficulty: 'medium',
            description: 'Hands-on GitHub Actions tutorial'
          },
          {
            title: 'Deploy to Production - GitLab CI',
            url: 'https://docs.gitlab.com/ee/ci/examples/deployment/',
            type: 'leetcode', 
            difficulty: 'medium',
            description: 'Production deployment pipeline'
          },
          {
            title: 'Jenkins Pipeline Tutorial',
            url: 'https://www.jenkins.io/doc/tutorials/build-a-node-js-and-react-app-with-npm/',
            type: 'neetcode',
            difficulty: 'medium',
            description: 'Build Node.js app with Jenkins'
          }
        ],
        gameConfig: {
          id: 'deploy-orbit-cloud-7',
          type: 'deploy-orbit',
          title: 'Deploy the Citadel',
          description: 'Build and connect pipeline nodes that automatically test, build, and deploy',
          objective: 'Connect stages in correct order - wrong order breaks the CI/CD flow',
          controls: 'Drag to connect pipeline stages',
          passingScore: 90,
          importanceWhy: 'CI/CD pipelines are the assembly line of modern software. Companies using CI/CD deploy 100x more frequently with 50% fewer failures than those doing manual releases. This game teaches you to build the automation that lets teams ship features daily instead of quarterly.'
        }
      },
      {
        id: 'cloud-8',
        courseId: 'cloud',
        title: 'The Realm of Observability (Monitoring & Logging)',
        description: 'Watch over the Skyforge using logs, metrics, and alerts',
        story: 'Even perfect systems crumble without vigilance. Learn to watch over the Skyforge using logs, metrics, and alerts.',
        narrative: 'You cannot fix what you cannot see. The Realm of Observability teaches you to instrument applications, collect metrics, aggregate logs, and set up alerts. When problems occur (and they will), your dashboards show exactly where and when, turning hours of debugging into minutes.',
        teachingContent: 'Observability means understanding system internal state from external outputs. Three pillars: Metrics (numerical data: CPU, requests/sec), Logs (event records: errors, requests), Traces (request flows through services). Tools: Prometheus (metrics collection), Grafana (visualization), ELK Stack (Elasticsearch, Logstash, Kibana for logs), Datadog/New Relic (all-in-one SaaS). Concepts: SLO (Service Level Objectives - targets like 99.9% uptime), SLA (Service Level Agreements - contracts), Alerts (notifications when thresholds exceeded). Best practices: monitor user-facing metrics, avoid alert fatigue, dashboard hierarchy (overview → drill-down).',
        xpReward: 320,
        challengeType: 'interactive',
        difficulty: 'advanced',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        videoTopic: 'Prometheus Grafana monitoring tutorial observability',
        aiSuggestedVideos: [
          {
            id: 'cloud8-v1',
            title: 'Prometheus Monitoring Tutorial',
            channelTitle: 'TechWorld with Nana',
            thumbnailUrl: 'https://i.ytimg.com/vi/h4Sl21AKiDg/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=h4Sl21AKiDg'
          },
          {
            id: 'cloud8-v2',
            title: 'Grafana Tutorial - Monitoring and Observability',
            channelTitle: 'TechWorld with Nana',
            thumbnailUrl: 'https://i.ytimg.com/vi/9TJx7QTrTyo/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=9TJx7QTrTyo'
          },
          {
            id: 'cloud8-v3',
            title: 'ELK Stack Tutorial - Elasticsearch, Logstash, and Kibana',
            channelTitle: 'Amigoscode',
            thumbnailUrl: 'https://i.ytimg.com/vi/gS_nHTWZEJ8/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=gS_nHTWZEJ8'
          }
        ],
        quizQuestions: [
          {
            id: 'cloud-8-q1',
            question: 'What are the three pillars of observability?',
            options: ['Servers, Storage, Network', 'Metrics, Logs, Traces', 'CPU, Memory, Disk', 'Dev, Staging, Production'],
            correctAnswer: 'Metrics, Logs, Traces',
            explanation: 'Observability relies on Metrics (numbers), Logs (events), and Traces (request paths) to understand system behavior.',
            type: 'multiple-choice'
          },
          {
            id: 'cloud-8-q2',
            question: 'What does SLO stand for?',
            options: ['Service Level Objective', 'System Log Output', 'Server Load Optimizer', 'Security Level Operation'],
            correctAnswer: 'Service Level Objective',
            explanation: 'SLO is a target reliability metric like "99.9% uptime" or "95% of requests under 200ms" that defines acceptable service quality.',
            type: 'multiple-choice'
          },
          {
            id: 'cloud-8-q3',
            question: 'Why is Grafana commonly used with Prometheus?',
            options: ['They are made by the same company', 'Grafana visualizes Prometheus metrics in dashboards', 'Prometheus cannot work alone', 'Grafana stores logs'],
            correctAnswer: 'Grafana visualizes Prometheus metrics in dashboards',
            explanation: 'Prometheus collects and stores metrics; Grafana creates beautiful, interactive dashboards to visualize those metrics.',
            type: 'multiple-choice'
          }
        ],
        externalResources: [
          {
            title: 'Prometheus Documentation',
            url: 'https://prometheus.io/docs/introduction/overview/',
            type: 'documentation',
            description: 'Learn Prometheus monitoring'
          },
          {
            title: 'Grafana Tutorials',
            url: 'https://grafana.com/tutorials/',
            type: 'documentation',
            description: 'Build your first dashboard'
          },
          {
            title: 'Observability Engineering Book',
            url: 'https://www.oreilly.com/library/view/observability-engineering/9781492076438/',
            type: 'neetcode',
            difficulty: 'hard',
            description: 'Deep dive into observability practices'
          }
        ],
        gameConfig: {
          id: 'search-challenge-cloud-8',
          type: 'search-challenge',
          title: 'Eyes of the Sky',
          description: 'Use observability tools to detect hidden anomalies across the matrix',
          objective: 'Find and fix system failures using metrics, logs, and traces',
          controls: 'Click on dashboards to investigate anomalies',
          passingScore: 85,
          importanceWhy: 'Without observability, finding production bugs is like searching in the dark. Companies with strong observability detect and fix issues in minutes instead of hours. This game simulates real incident response - identifying anomalies, correlating signals, and root-causing problems.'
        }
      },
      {
        id: 'cloud-9',
        courseId: 'cloud',
        title: 'The DevOps Devas (Automation & Cloud Synergy)',
        description: 'Merge all knowledge — automate, deploy, maintain balance',
        story: 'At last, you must merge all knowledge — automate the world, deploy harmony, and maintain balance.',
        narrative: 'The final trial! Build an end-to-end system combining everything: IaC provisions cloud infrastructure, Docker containerizes apps, Kubernetes orchestrates them, CI/CD deploys automatically, and monitoring watches over all. Your choices impact uptime, cost, and security. Become a Cloud Sage.',
        teachingContent: 'DevOps Cloud Synergy combines all practices: Write Terraform to provision VPC, servers, databases. Build Docker images in CI/CD pipeline. Deploy containers to Kubernetes cluster. Monitor with Prometheus/Grafana. Practice DevSecOps (security integration): scan images for vulnerabilities, secrets management (never commit keys!), least privilege access. Cost optimization: right-size instances, use auto-scaling, reserved instances for steady workloads, spot instances for batch jobs. Production checklist: automated deployments, rollback plan, monitoring/alerting, backup/disaster recovery, security hardening.',
        xpReward: 400,
        challengeType: 'interactive',
        difficulty: 'advanced',
        unlocked: false,
        completed: false,
        currentStage: 'narrative',
        videoTopic: 'DevOps full project end-to-end deployment tutorial',
        aiSuggestedVideos: [
          {
            id: 'cloud9-v1',
            title: 'Complete DevOps Project - From Code to Production',
            channelTitle: 'TechWorld with Nana',
            thumbnailUrl: 'https://i.ytimg.com/vi/S_0q75eD8Yc/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=S_0q75eD8Yc'
          },
          {
            id: 'cloud9-v2',
            title: 'AWS Full Course - Learn AWS In 12 Hours',
            channelTitle: 'freeCodeCamp',
            thumbnailUrl: 'https://i.ytimg.com/vi/ulprqHHWlng/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=ulprqHHWlng'
          },
          {
            id: 'cloud9-v3',
            title: 'DevSecOps - Security in DevOps Pipeline',
            channelTitle: 'Simplilearn',
            thumbnailUrl: 'https://i.ytimg.com/vi/nrhxNNH5lt0/maxresdefault.jpg',
            videoUrl: 'https://www.youtube.com/watch?v=nrhxNNH5lt0'
          }
        ],
        quizQuestions: [
          {
            id: 'cloud-9-q1',
            question: 'What is DevSecOps?',
            options: ['Development Security Operations - integrating security into DevOps', 'A new cloud provider', 'A security tool', 'A type of server'],
            correctAnswer: 'Development Security Operations - integrating security into DevOps',
            explanation: 'DevSecOps means building security into every stage of development and deployment, not treating it as an afterthought.',
            type: 'multiple-choice'
          },
          {
            id: 'cloud-9-q2',
            question: 'Which is the BEST way to reduce cloud costs?',
            options: ['Delete all monitoring', 'Use auto-scaling and right-sized instances', 'Run everything on one large server', 'Turn off security'],
            correctAnswer: 'Use auto-scaling and right-sized instances',
            explanation: 'Auto-scaling adjusts capacity to demand, and right-sizing ensures you are not paying for unused resources. Never compromise security or monitoring for cost.',
            type: 'multiple-choice'
          },
          {
            id: 'cloud-9-q3',
            question: 'What should a production-ready system include?',
            options: ['Only the application code', 'Automated deployments, monitoring, backups, and security', 'Just a server', 'Manual deployment process'],
            correctAnswer: 'Automated deployments, monitoring, backups, and security',
            explanation: 'Production systems need comprehensive automation, observability, disaster recovery, and security to ensure reliability.',
            type: 'multiple-choice'
          }
        ],
        externalResources: [
          {
            title: 'AWS Well-Architected Framework',
            url: 'https://aws.amazon.com/architecture/well-architected/',
            type: 'documentation',
            description: 'Best practices for cloud architecture'
          },
          {
            title: 'DevOps Roadmap',
            url: 'https://roadmap.sh/devops',
            type: 'neetcode',
            difficulty: 'hard',
            description: 'Complete DevOps learning path'
          },
          {
            title: 'The Phoenix Project (Book)',
            url: 'https://www.amazon.com/Phoenix-Project-DevOps-Helping-Business/dp/0988262592',
            type: 'documentation',
            description: 'DevOps novel about transformation'
          }
        ],
        gameConfig: {
          id: 'deploy-orbit-cloud-9',
          type: 'deploy-orbit',
          title: 'Harmony of the Clouds',
          description: 'Build an end-to-end system: deploy an app, automate scaling, secure the pipeline',
          objective: 'Balance uptime, cost, and security in a production environment',
          controls: 'Configure all components of the cloud system',
          passingScore: 90,
          importanceWhy: 'This capstone integrates everything you have learned. Real DevOps engineers architect complete systems balancing reliability, cost, security, and speed. Mastering this means you can build production-grade infrastructure that serves millions of users.'
        }
      }
    ]
  }
];

export const useLearning = create<LearningState>()(
  persist(
    (set, get) => ({
      user: null,
      courses: initialCourses,
      userProgress: {
        userId: 'guest',
        totalXP: 0,
        level: 1,
        badges: [],
        completedLevels: [],
        currentCourse: null,
        currentLevel: null,
      },
      aiCompanion: {
        isActive: false,
        messages: [],
        currentHint: null,
        adaptiveDifficulty: 1,
      },
      
      login: async (username: string, password: string) => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Login failed');
        }
        
        const data = await response.json();
        set({ user: data.user });
        
        await get().syncProgress();
      },
      
      signup: async (username: string, password: string, email?: string) => {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, email }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Signup failed');
        }
        
        const data = await response.json();
        set({ user: data.user });
        
        await get().syncProgress();
      },
      
      logout: () => {
        set({
          user: null,
          userProgress: {
            userId: 'guest',
            totalXP: 0,
            level: 1,
            badges: [],
            completedLevels: [],
            currentCourse: null,
            currentLevel: null,
          }
        });
      },
      
      syncProgress: async () => {
        const { user } = get();
        if (!user) return;
        
        try {
          const response = await fetch(`/api/progress`);
          if (response.ok) {
            const data = await response.json();
            
            if (data.progress) {
              set((state) => ({
                userProgress: {
                  userId: user.id.toString(),
                  totalXP: data.progress.totalXP || 0,
                  level: data.progress.level || 1,
                  badges: data.badges || [],
                  completedLevels: data.completedLevels?.map((cl: any) => cl.levelId) || [],
                  currentCourse: data.progress.currentCourse,
                  currentLevel: data.progress.currentLevel,
                },
                courses: state.courses.map(course => ({
                  ...course,
                  levels: course.levels.map((level, index) => {
                    const isCompleted = data.completedLevels?.some((cl: any) => cl.levelId === level.id);
                    const prevCompleted = index === 0 || data.completedLevels?.some((cl: any) => cl.levelId === course.levels[index - 1].id);
                    return {
                      ...level,
                      completed: isCompleted,
                      unlocked: index === 0 || prevCompleted,
                    };
                  })
                }))
              }));
            }
          }
        } catch (error) {
          console.error('Failed to sync progress:', error);
        }
      },
      
      setCourses: (courses) => set({ courses }),
      
      selectCourse: (courseId) => set((state) => ({
        userProgress: {
          ...state.userProgress,
          currentCourse: courseId,
          currentLevel: null,
        }
      })),
      
      selectLevel: (levelId) => {
        set((state) => {
          const updatedCourses = state.courses.map(course => ({
            ...course,
            levels: course.levels.map(level => 
              level.id === levelId 
                ? { ...level, currentStage: 'narrative' as LevelStage }
                : level
            )
          }));
          
          return {
            courses: updatedCourses,
            userProgress: {
              ...state.userProgress,
              currentLevel: levelId,
            }
          };
        });
      },
      
      advanceStage: (levelId, newStage) => {
        const stageOrder: LevelStage[] = ['narrative', 'teaching-game', 'ai-videos', 'assessment', 'practice-game', 'resources', 'complete'];

        const state = get();
        const level = state.courses
          .flatMap(c => c.levels)
          .find(l => l.id === levelId);

        if (!level) {
          console.error(`Level ${levelId} not found`);
          return false;
        }

        const currentStage = level.currentStage || 'narrative';

        if (currentStage === newStage) {
          console.warn(`Level already on stage ${newStage}`);
          return false;
        }

        const currentIndex = stageOrder.indexOf(currentStage);
        const newIndex = stageOrder.indexOf(newStage);

        const hasGame = !!level.gameConfig;
        const hasResources = !!level.externalResources && level.externalResources.length > 0;

        const isValidTransition =
          newIndex > currentIndex ||
          (newIndex === stageOrder.indexOf('complete') && !hasResources && currentStage === 'practice-game') ||
          (newIndex === 0 && currentStage !== 'teaching-game') ||
          (currentStage === 'ai-videos' && newStage === 'teaching-game') ||
          (currentStage === 'ai-videos' && newStage === 'practice-game') ||
          (currentStage === 'practice-game' && newStage === 'assessment');

        if (!isValidTransition) {
          console.error(`Invalid stage transition from ${currentStage} to ${newStage}`);
          return false;
        }

        set((state) => ({
          courses: state.courses.map(course => ({
            ...course,
            levels: course.levels.map(level =>
              level.id === levelId
                ? { ...level, currentStage: newStage }
                : level
            )
          }))
        }));

        return true;
      },

      goBackStage: (levelId) => {
        const stageOrder: LevelStage[] = ['narrative', 'teaching-game', 'ai-videos', 'assessment', 'practice-game', 'resources', 'complete'];

        const state = get();
        const level = state.courses
          .flatMap(c => c.levels)
          .find(l => l.id === levelId);

        if (!level) {
          console.error(`Level ${levelId} not found`);
          return false;
        }

        const currentStage = level.currentStage || 'narrative';
        const currentIndex = stageOrder.indexOf(currentStage);

        if (currentIndex <= 0) {
          console.warn(`Cannot go back from the first stage: ${currentStage}`);
          return false;
        }

        const previousStage = stageOrder[currentIndex - 1];

        set((state) => ({
          courses: state.courses.map(course => ({
            ...course,
            levels: course.levels.map(level =>
              level.id === levelId
                ? { ...level, currentStage: previousStage }
                : level
            )
          }))
        }));

        return true;
      },
      
      startGame: (levelId) => {
        const { courses, userProgress } = get();
        const level = courses
          .flatMap(c => c.levels)
          .find(l => l.id === levelId);
        
        if (!level?.gameConfig) {
          console.error('No game config found for level:', levelId);
          return false;
        }
        
        const currentStage = level.currentStage || 'narrative';
        if (currentStage !== 'practice-game' && currentStage !== 'teaching-game') {
          console.error(`Cannot start game from stage ${currentStage}. Must be in practice-game or teaching-game stage.`);
          return false;
        }
        
        const existingGame = userProgress.currentGame;
        const isResuming = existingGame?.levelId === levelId;
        
        set((state) => ({
          userProgress: {
            ...state.userProgress,
            currentGame: {
              levelId,
              gameId: level.gameConfig!.id,
              attempts: isResuming && existingGame ? existingGame.attempts : 0,
              bestScore: isResuming && existingGame ? existingGame.bestScore : 0,
              timeSpent: isResuming && existingGame ? existingGame.timeSpent : 0,
              completed: false,
            }
          }
        }));
        
        return true;
      },
      
      completeGame: async (levelId, result) => {
        const { userProgress } = get();
        
        const currentGame = userProgress.currentGame;
        if (!currentGame) {
          console.error('No active game session to complete');
          return;
        }
        
        const newBestScore = Math.max(currentGame.bestScore, result.score);
        const newAttempts = currentGame.attempts + 1;
        const newTimeSpent = currentGame.timeSpent + result.timeSpent;
        
        if (result.success) {
          set((state) => ({
            userProgress: {
              ...state.userProgress,
              currentGame: {
                ...currentGame,
                attempts: newAttempts,
                bestScore: newBestScore,
                timeSpent: newTimeSpent,
                completed: true,
              }
            }
          }));
          
          // Advance to assessment stage after successful game completion
          get().advanceStage(levelId, 'assessment');
          
          set((state) => ({
            userProgress: {
              ...state.userProgress,
              currentGame: null,
            }
          }));
        } else {
          set((state) => ({
            userProgress: {
              ...state.userProgress,
              currentGame: {
                ...currentGame,
                attempts: newAttempts,
                bestScore: newBestScore,
                timeSpent: newTimeSpent,
              }
            }
          }));
        }
      },
      
      completeLevel: async (levelId, xpEarned) => {
        const { user, userProgress, courses } = get();
        const newTotalXP = userProgress.totalXP + xpEarned;
        const newLevel = Math.floor(newTotalXP / 500) + 1;
        
        const courseId = courses.find(c => c.levels.some(l => l.id === levelId))?.id || '';
        
        const updatedCourses = courses.map(course => ({
          ...course,
          levels: course.levels.map((level, index) => {
            if (level.id === levelId) {
              return { ...level, completed: true };
            }
            if (course.levels[index - 1]?.id === levelId) {
              return { ...level, unlocked: true };
            }
            return level;
          })
        }));
        
        set({
          courses: updatedCourses,
          userProgress: {
            ...userProgress,
            totalXP: newTotalXP,
            level: newLevel,
            completedLevels: [...userProgress.completedLevels, levelId],
          }
        });
        
        if (user) {
          try {
            await fetch('/api/progress/complete-level', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ levelId, courseId, xpEarned }),
            });
            
            await fetch('/api/progress/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                totalXP: newTotalXP,
                level: newLevel,
                currentCourse: courseId,
                currentLevel: levelId,
              }),
            });
          } catch (error) {
            console.error('Failed to save progress to database:', error);
          }
        }
      },
      
      addBadge: async (badge) => {
        const { user } = get();
        
        set((state) => ({
          userProgress: {
            ...state.userProgress,
            badges: [...state.userProgress.badges, badge],
          }
        }));
        
        if (user) {
          try {
            await fetch('/api/badges/earn', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                badgeId: badge.id,
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                rarity: badge.rarity || 'common',
              }),
            });
          } catch (error) {
            console.error('Failed to save badge to database:', error);
          }
        }
      },
      
      updateAIMessages: (message) => set((state) => ({
        aiCompanion: {
          ...state.aiCompanion,
          messages: [
            ...state.aiCompanion.messages,
            { ...message, timestamp: new Date() }
          ]
        }
      })),
      
      toggleAICompanion: () => set((state) => ({
        aiCompanion: {
          ...state.aiCompanion,
          isActive: !state.aiCompanion.isActive,
        }
      })),
      
      setCurrentHint: (hint) => set((state) => ({
        aiCompanion: {
          ...state.aiCompanion,
          currentHint: hint,
        }
      })),
    }),
    {
      name: 'skillquest-learning',
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          console.log('Migrating from version', version, 'to version 2 - Resetting all level stages');
          
          if (persistedState.courses) {
            persistedState.courses = persistedState.courses.map((course: any) => ({
              ...course,
              levels: course.levels.map((level: any) => ({
                ...level,
                currentStage: 'narrative'
              }))
            }));
          }
          
          if (persistedState.userProgress) {
            persistedState.userProgress.currentLevel = null;
          }
        }
        return persistedState;
      }
    }
  )
);
