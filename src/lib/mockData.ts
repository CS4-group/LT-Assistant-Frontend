export const courses = [
  {
    id: 'cs101',
    title: 'Introduction to Computer Science',
    description: 'Learn the fundamentals of programming and computer science.',
  },
  {
    id: 'phy201',
    title: 'Modern Physics',
    description: 'Explore the world of quantum mechanics and relativity.',
  },
  {
    id: 'eng101',
    title: 'English Literature',
    description: 'Analyze classic and contemporary literary works.',
  },
];

export const clubs = [
  {
    id: 'debate',
    title: 'Debate Club',
    description: 'Sharpen your public speaking and critical thinking skills.',
  },
  {
    id: 'robotics',
    title: 'Robotics Club',
    description: 'Design, build, and program robots for competitions.',
  },
  {
    id: 'chess',
    title: 'Chess Club',
    description: 'Master the game of kings.',
  },
];

export const teachers = [
  {
    id: 'mr-smith',
    title: 'Mr. Smith',
    description: 'Teaches Introduction to Computer Science.',
  },
  {
    id: 'ms-jones',
    title: 'Ms. Jones',
    description: 'Teaches Modern Physics.',
  },
  {
    id: 'mrs-davis',
    title: 'Mrs. Davis',
    description: 'Teaches English Literature.',
  },
];

export const reviews = [
  // CS101 Reviews
  {
    id: 'review-cs101-1',
    itemId: 'cs101',
    user: { name: 'Alice', avatarUrl: 'https://i.pravatar.cc/150?u=alice' },
    rating: 5,
    comment: 'Great introductory course! Mr. Smith is an amazing teacher.',
  },
  {
    id: 'review-cs101-2',
    itemId: 'cs101',
    user: { name: 'Bob', avatarUrl: 'https://i.pravatar.cc/150?u=bob' },
    rating: 4,
    comment: 'Challenging but rewarding. Learned a lot.',
  },
  // Debate Club Reviews
  {
    id: 'review-debate-1',
    itemId: 'debate',
    user: { name: 'Charlie', avatarUrl: 'https://i.pravatar.cc/150?u=charlie' },
    rating: 5,
    comment: 'The debate club has been a fantastic experience. I\'ve become so much more confident in my public speaking.',
  },
  // Mr. Smith Reviews
  {
    id: 'review-mr-smith-1',
    itemId: 'mr-smith',
    user: { name: 'Alice', avatarUrl: 'https://i.pravatar.cc/150?u=alice' },
    rating: 5,
    comment: 'Mr. Smith makes learning to code so much fun and is always willing to help.',
  },
];
