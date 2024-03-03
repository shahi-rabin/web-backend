const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const User = require("../models/User");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken"); // Add this line for JWT

// Initialize a variable to store the valid token
let validToken;

beforeAll(async () => {
  await User.deleteMany({});
});

test("user registration", async () => {
  const res = await api
    .post("/users/register")
    .send({
      username: "testUser",
      password: "test123",
      fullname: "Test User 2",
      email: "test2@gmail.com",
    })
    .expect(201);

  expect(res.body.status).toBe("success");
});

test("registration with duplicate username", async () => {
  const res = await api
    .post("/users/register")
    .send({
      username: "testUser",
      password: "testUser",
      fullname: "Test User 2",
      email: "test2@gmail.com",
    })
    .expect(400);
  expect(res.body.error).toMatch(/Duplicate/);
});

test("registration with incomplete fields", async () => {
  const res = await api
    .post("/users/register")
    .send({
      username: "testUser2",
      password: "testUser",
      fullname: "Test User 2",
    })
    .expect(400);
  expect(res.body.error).toMatch(/fill in all fields/);
});

test("registered user can login", async () => {
  const res = await api
    .post("/users/login")
    .send({
      username: "testUser",
      password: "test123",
    })
    .expect(200);

  expect(res.body.token).toBeDefined();
  validToken = res.body.token;
});

test("user login with unregistered username", async () => {
  const res = await api
    .post("/users/login")
    .send({
      username: "testUser2",
      password: "test123",
    })
    .expect(400);

  expect(res.body.error).toBe("User is not registered");
});

test("user login with wrong password", async () => {
  const res = await api
    .post("/users/login")
    .send({
      username: "testUser",
      password: "test1234",
    })
    .expect(400);
});

test("user login with incomplete fields", async () => {
  const res = await api
    .post("/users/login")
    .send({
      username: "testUser",
    })
    .expect(400);
  expect(res.body.error).toMatch(/fill in all fields/);
});

test("update user profile - successful update", async () => {
  const res = await api
    .put("/users/edit-profile")
    .set("Authorization", `Bearer ${validToken}`)
    .send({
      fullname: "Updated Fullname",
      bio: "Updated bio",
    })
    .expect(200);

  expect(res.body.data[0].fullname).toBe("Updated Fullname");
  expect(res.body.data[0].bio).toBe("Updated bio");
});

test("update user profile - duplicate username", async () => {
  const existingUser = await User.create({
    username: "existingUserrrr",
    password: "test1234567899",
    fullname: "Existing User",
    email: "existingggg@test.com",
    phoneNumber: "123456789999",
  });

  const res = await api
    .put("/users/edit-profile")
    .set("Authorization", `Bearer ${validToken}`)
    .send({
      username: "existingUserrrr",
    })
    .expect(400);

  expect(res.body.error).toBe("Username is already taken");
});

test("update user profile - duplicate email", async () => {
  const existingUser = await User.create({
    username: "existingUserr",
    password: "test1234567899",
    fullname: "Existing User",
    email: "existingg@test.com",
    phoneNumber: "12345678999",
  });

  const res = await api
    .put("/users/edit-profile")
    .set("Authorization", `Bearer ${validToken}`)
    .send({
      email: "existingg@test.com",
    })
    .expect(400);

  expect(res.body.error).toBe("Email is already taken");
});

test("update user profile - change phone number", async () => {
  const phoneNumber = "1234567890"; // Provide a new phone number here

  const res = await api
    .put("/users/edit-profile")
    .set("Authorization", `Bearer ${validToken}`)
    .send({
      phoneNumber: phoneNumber,
    })
    .expect(200);

  expect(res.body.data[0].phoneNumber).toBe(phoneNumber);
});

test("update user profile - duplicate phone number", async () => {
  const existingUser = await User.create({
    username: "existingUser",
    password: "test123456789",
    fullname: "Existing User",
    email: "existing@test.com",
    phoneNumber: "1234567899",
  });

  const res = await api
    .put("/users/edit-profile")
    .set("Authorization", `Bearer ${validToken}`)
    .send({
      phoneNumber: "1234567899",
    })
    .expect(400);

  expect(res.body.error).toBe("Phone number is already taken");
});

test("update user profile - unauthorized", async () => {
  const res = await api
    .put("/users/edit-profile")
    .send({
      fullname: "Unauthorized Update",
    })
    .expect(401);

  expect(res.body.error).toBe("auth token not present");
});

test("update password - incorrect current password", async () => {
  const res = await api
    .put("/users/change-password")
    .set("Authorization", `Bearer ${validToken}`)
    .send({
      currentPassword: "wrongPassword",
      newPassword: "newPassword123",
      confirmPassword: "newPassword123",
    })
    .expect(401);

  expect(res.body.error).toBe("Incorrect current password");
});

test("update password - new password and confirm password do not match", async () => {
  const res = await api
    .put("/users/change-password")
    .set("Authorization", `Bearer ${validToken}`)
    .send({
      currentPassword: "test123",
      newPassword: "newPassword123",
      confirmPassword: "mismatchPassword",
    })
    .expect(400);

  expect(res.body.error).toBe("New password and confirm password do not match");
});

test("update password - new password same as current password", async () => {
  const res = await api
    .put("/users/change-password")
    .set("Authorization", `Bearer ${validToken}`)
    .send({
      currentPassword: "test123",
      newPassword: "test123",
      confirmPassword: "test123",
    })
    .expect(400);

  expect(res.body.error).toBe(
    "New password must be different from the current password"
  );
});

test("update password - successful", async () => {
  const res = await api
    .put("/users/change-password")
    .set("Authorization", `Bearer ${validToken}`) // Use the stored token
    .send({
      currentPassword: "test123",
      newPassword: "newPassword123",
      confirmPassword: "newPassword123",
    })
    .expect(204);

  // Perform login with the updated password
  const loginRes = await api
    .post("/users/login")
    .send({
      username: "testUser",
      password: "newPassword123",
    })
    .expect(200);

  expect(loginRes.body.token).toBeDefined();
});

test("get user info by ID", async () => {
  const newUser = await User.create({
    username: "getUserInfoTest",
    password: "test123456789",
    fullname: "Get User Info Test",
    email: "getinfo@test.com",
  });

  const res = await api
    .get(`/users/${newUser._id}`)
    .set("Authorization", `Bearer ${validToken}`)
    .expect(200);

  expect(res.body.username).toBe("getUserInfoTest");
  expect(res.body.fullname).toBe("Get User Info Test");
});

afterAll(async () => await mongoose.connection.close());
