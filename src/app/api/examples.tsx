// Example usage of the useApi hook
// This file demonstrates how to use the API hook with all CRUD operations

"use client";

import { useEffect } from "react";
import { useApi, API_CONFIG, User, Client, Mechanic } from "./index";

/**
 * Example: GET - Fetch list of users
 */
export function ExampleGetUsers() {
  const { data, loading, error, get } = useApi<User[]>();

  useEffect(() => {
    // Fetch users on component mount
    get(API_CONFIG.ENDPOINTS.USERS.LIST);
  }, [get]);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Users List (GET)</h2>
      <ul>
        {data?.map((user) => (
          <li key={user.id}>
            {user.email} - {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example: GET single user by ID
 */
export function ExampleGetUserById({ userId }: { userId: number }) {
  const { data, loading, error, get } = useApi<User>();

  useEffect(() => {
    get(API_CONFIG.ENDPOINTS.USERS.GET(userId));
  }, [get, userId]);

  if (loading) return <div>Loading user...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>User Details (GET by ID)</h2>
      {data && (
        <div>
          <p>ID: {data.id}</p>
          <p>Email: {data.email}</p>
          <p>Role: {data.role}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Example: POST - Create a new mechanic
 */
export function ExampleCreateMechanic() {
  const { data, loading, error, post } = useApi<Mechanic>();

  const handleCreate = async () => {
    const newMechanic: Mechanic = {
      name: "John Doe",
      phone: "+1234567890",
      email: "john.doe@example.com",
      specialty: "Engine Repair",
      experience: 5,
    };

    const result = await post(
      API_CONFIG.ENDPOINTS.MECHANICS.CREATE,
      newMechanic
    );

    if (result.error) {
      console.error("Failed to create mechanic:", result.error);
    } else {
      console.log("Mechanic created:", result.data);
    }
  };

  return (
    <div>
      <h2>Create Mechanic (POST)</h2>
      <button onClick={handleCreate} disabled={loading}>
        {loading ? "Creating..." : "Create Mechanic"}
      </button>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {data && <p style={{ color: "green" }}>Created: {data.name}</p>}
    </div>
  );
}

/**
 * Example: PUT - Update a dashboard
 */
export function ExampleUpdateClient() {
  const { data, loading, error, put } = useApi<Client>();

  const handleUpdate = async () => {
    const updatedClient: Client = {
      id: 1,
      name: "Jane Smith",
      phone: "+0987654321",
      email: "jane.smith@example.com",
    };

    const result = await put(
      API_CONFIG.ENDPOINTS.CLIENTS.UPDATE,
      updatedClient
    );

    if (result.error) {
      console.error("Failed to update dashboard:", result.error);
    } else {
      console.log("Client updated:", result.data);
    }
  };

  return (
    <div>
      <h2>Update Client (PUT)</h2>
      <button onClick={handleUpdate} disabled={loading}>
        {loading ? "Updating..." : "Update Client"}
      </button>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {data && <p style={{ color: "green" }}>Updated: {data.name}</p>}
    </div>
  );
}

/**
 * Example: DELETE - Delete a user
 */
export function ExampleDeleteUser({ userId }: { userId: number }) {
  const { loading, error, del } = useApi<string>();

  const handleDelete = async () => {
    const result = await del(API_CONFIG.ENDPOINTS.USERS.DELETE(userId));

    if (result.error) {
      console.error("Failed to delete user:", result.error);
    } else {
      console.log("User deleted successfully");
    }
  };

  return (
    <div>
      <h2>Delete User (DELETE)</h2>
      <button onClick={handleDelete} disabled={loading}>
        {loading ? "Deleting..." : `Delete User ${userId}`}
      </button>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
    </div>
  );
}

/**
 * Example: Authentication with token management
 */
export function ExampleAuthentication() {
  const { data, loading, error, post, setToken, removeToken, hasToken } =
    useApi<{
      userId: number;
      username: string;
    }>();

  const handleLogin = async () => {
    const credentials = {
      email: "user@example.com",
      password: "password123",
    };

    const result = await post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);

    if (result.data) {
      // In a real app, the server would return a token
      // For Basic Auth, we'd encode credentials
      const token = btoa(`${credentials.email}:${credentials.password}`);
      setToken(token);
      console.log("Logged in successfully");
    }
  };

  const handleLogout = () => {
    removeToken();
    console.log("Logged out");
  };

  return (
    <div>
      <h2>Authentication Example</h2>
      <p>Has Token: {hasToken() ? "Yes" : "No"}</p>
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
      <button onClick={handleLogout}>Logout</button>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {data && <p style={{ color: "green" }}>Welcome, {data.username}!</p>}
    </div>
  );
}

/**
 * Combined Example: Full CRUD Demo Component
 */
export default function ApiExamplesDemo() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>API Hook Examples</h1>
      <hr />

      <ExampleAuthentication />
      <hr />

      <ExampleGetUsers />
      <hr />

      <ExampleCreateMechanic />
      <hr />

      <ExampleUpdateClient />
      <hr />

      <ExampleDeleteUser userId={1} />
    </div>
  );
}
