import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Auth0Test = () => {
  const { 
    isLoading, 
    isAuthenticated, 
    error, 
    user, 
    loginWithRedirect, 
    logout 
  } = useAuth0();

  if (isLoading) {
    return <div>Loading Auth0...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', border: '1px solid red', margin: '20px' }}>
        <h3>Auth0 Error:</h3>
        <p>{error.message}</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Auth0 Status</h3>
      <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
      
      {isAuthenticated ? (
        <div>
          <p><strong>User Info:</strong></p>
          <pre>{JSON.stringify(user, null, 2)}</pre>
          <button 
            onClick={() => logout({ returnTo: window.location.origin })}
            style={{ padding: '10px', marginTop: '10px' }}
          >
            Logout
          </button>
        </div>
      ) : (
        <button 
          onClick={() => loginWithRedirect()}
          style={{ padding: '10px', marginTop: '10px' }}
        >
          Login with Auth0
        </button>
      )}
    </div>
  );
};

export default Auth0Test;