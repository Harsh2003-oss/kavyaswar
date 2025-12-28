import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { poemAPI } from '../../utils/api';

function ViewPoem() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [poem, setPoem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoem();
  }, [id]);

  const fetchPoem = async () => {
    try {
      const response = await poemAPI.getById(id);
      setPoem(response.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load poem');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!poem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Poem not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold mb-6">{poem.title}</h1>
          <pre className="whitespace-pre-wrap text-lg mb-6">{poem.content}</pre>
          
          <div className="flex gap-4">
            <button
              onClick={() => navigate(`/edit-poem/${id}`)}
              className="px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Edit
            </button>
            <button
              onClick={() => navigate(`/slideshow/${id}`)}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Slideshow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewPoem;