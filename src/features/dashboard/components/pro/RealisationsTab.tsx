import React from "react";
import {
  FiPlus,
  FiLink,
  FiHeart,
  FiMessageCircle,
  FiMoreVertical,
} from "react-icons/fi";
import { usePosts } from "../../hooks/useDashboardData";

const RealisationsTab: React.FC = () => {
  const { data: posts = [] } = usePosts();

  return (
    <div className="dash-posts-section">
      <div className="dash-section-header">
        <div>
          <h2>Mes réalisations</h2>
          <p className="dash-section-subtitle">Partagez vos meilleurs projets</p>
        </div>
        <button className="dash-btn-primary">
          <FiPlus /> Ajouter une réalisation
        </button>
      </div>

      <div className="dash-posts-grid">
        {posts.map((post) => (
          <div key={post.id} className="dash-post-card">
            {post.type === "image" && (
              <div className="dash-post-media">
                <img src={post.medias[0]} alt={post.titre} />
              </div>
            )}
            {post.type === "link" && (
              <div className="dash-post-link">
                <FiLink />
                <a href={post.url} target="_blank" rel="noopener noreferrer">
                  {post.url}
                </a>
              </div>
            )}
            <div className="dash-post-content">
              <h3>{post.titre}</h3>
              <p>{post.description}</p>
              <div className="dash-post-footer">
                <div className="dash-post-stats">
                  <span>
                    <FiHeart /> {post.likes}
                  </span>
                  <span>
                    <FiMessageCircle /> {post.commentaires}
                  </span>
                </div>
                <span className="dash-post-date">
                  {new Date(post.date).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
            <button className="dash-post-more">
              <FiMoreVertical />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealisationsTab;
