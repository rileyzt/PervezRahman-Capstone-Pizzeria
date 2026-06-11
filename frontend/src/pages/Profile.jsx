// PROFILE PAGE — using Bootstrap card classes

import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return <p className="text-center text-secondary py-5">Loading...</p>;

  return (
    <div className="container py-5" style={{ maxWidth: '480px' }}>
      <h1 className="fw-bold text-white mb-4">My Profile</h1>

      <div className="card border-dark-custom p-4">
        {/* Avatar */}
        <div className="bg-brand rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
          style={{ width: '64px', height: '64px', fontSize: '1.5rem', fontWeight: 700 }}>
          {user.name ? user.name[0].toUpperCase() : 'U'}
        </div>

        <div className="d-flex justify-content-between border-bottom border-dark-custom py-3">
          <span className="text-secondary">Name</span>
          <span className="text-white fw-medium">{user.name}</span>
        </div>
        <div className="d-flex justify-content-between border-bottom border-dark-custom py-3">
          <span className="text-secondary">Email</span>
          <span className="text-white fw-medium">{user.email}</span>
        </div>
        <div className="d-flex justify-content-between border-bottom border-dark-custom py-3">
          <span className="text-secondary">Role</span>
          <span className="text-white fw-medium text-capitalize">{user.role}</span>
        </div>
        <div className="d-flex justify-content-between border-bottom border-dark-custom py-3">
          <span className="text-secondary">Phone</span>
          <span className="text-white fw-medium">{user.phone || 'Not set'}</span>
        </div>
        <div className="d-flex justify-content-between py-3">
          <span className="text-secondary">Address</span>
          <span className="text-white fw-medium">{user.address || 'Not set'}</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
