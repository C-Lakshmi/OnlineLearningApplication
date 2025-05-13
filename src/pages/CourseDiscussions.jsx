import React, { useEffect, useState } from 'react';

const CourseDiscussions = ({ courseId, userId, role }) => {
  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState('');
  const [showForm, setShowForm] = useState(false);


  const fetchPosts = async () => {
    const res = await fetch(`http://localhost:8000/api/discussions/${courseId}`);
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, [courseId]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    await fetch('http://localhost:8000/api/discussions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        course_id: courseId,
        user_id: userId,
        user_role: role,
        post_text: postText
      })
    });

    setPostText('');
    fetchPosts();
  };

  return (
    <div>
      <h4 className="text-lg font-semibold mb-2">📢 Discussions</h4>
      <ul className="space-y-3">
      <ul className="space-y-3">
      <ul className="space-y-3">
  {posts.map((post, i) => {
    const isInstructor = post.user_role === 'instructor';
    const bgColor =
      isInstructor ? 'bg-green-100' :
      post.user_role === 'student' ? 'bg-blue-100' :
      'bg-white';

    const alignment = isInstructor ? 'justify-end text-right' : 'justify-start text-left';

    return (
      <li key={i} className={`flex ${alignment}`}>
        <div className={`w-[65%] p-3 border rounded shadow ${bgColor}`}>
          <p className="text-md font-bold">{post.post_text}</p>
          <p className="text-md text-gray-600 mt-1">
            — {post.user_role} <b> #{post.user_id} {post.name}</b>, {new Date(post.created_at).toLocaleString()}
          </p>
        </div>
      </li>
    );
  })}
</ul>
  </ul>
</ul>
      <button
  onClick={() => setShowForm(!showForm)}
  className="mb-4 mt-4 bg-blue-600 text-white px-4 py-2 rounded"
>
  {showForm ? 'Cancel' : 'Create Post'}
</button>

{showForm && (
  <form onSubmit={handlePost} className="space-y-2 mb-4">
    <textarea
      value={postText}
      onChange={e => setPostText(e.target.value)}
      placeholder="Write your comment..."
      className="w-full border p-2 rounded"
      required
    />
    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
     Post
    </button>
  </form>
  )}
    </div>
  );
};

export default CourseDiscussions;
