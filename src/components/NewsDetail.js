import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5001/api/news-digest/${article_id}`);
        if (!response.ok) throw new Error('Article not found');
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) return <p>Loading article...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="news-detail">
      <button onClick={() => navigate('/news_digest')}>Back to News Digest</button>
      <h1>{article.title}</h1>
      <p>{article.originalSummary}</p>
      <p><strong>Source:</strong> {article.source}</p>
      <p><strong>Category:</strong> {article.category}</p>
      {article.aiSummary && (
        <>
          <h2>AI Generated Summary</h2>
          <p>{article.aiSummary}</p>
        </>
      )}
    </div>
  );
};

export default NewsDetail;
