import request from "supertest";
import app from "../src/app";
import { connectTestDB, disconnectTestDB, clearTestDB } from "./testDb";
import User from "../src/app/modules/user/user.model";
import MenuItem from "../src/app/modules/menu/menu.model";
import { UserRole } from "../src/app/modules/user/user.interface";
beforeAll(async () => {
  await connectTestDB();
});
afterAll(async () => {
  await disconnectTestDB();
});
afterEach(async () => {
  await clearTestDB();
});
const loginAs = async (role: UserRole, username: string) => {
  await User.create({
    name: username,
    username,
    password: "password123",
    role,
  });
  const agent = request.agent(app);
  await agent
    .post("/api/v1/auth/login")
    .send({ username, password: "password123" });
  return agent;
};
describe("Order lifecycle and state machine", () => {
  it("lets a waiter create a dine-in order, starting as pending", async () => {
    const waiter = await loginAs("waiter", "waiter1");
    const menuItem = await MenuItem.create({
      name: "Pizza",
      category: "Main",
      price: 10,
      available: true,
    });
    const res = await waiter
      .post("/api/v1/orders")
      .send({
        orderType: "dine-in",
        items: [{ menuItemId: menuItem._id.toString(), quantity: 2 }],
      });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("pending");
    expect(res.body.data.total).toBe(20);
  });
  it("rejects a waiter trying to confirm their own order", async () => {
    const waiter = await loginAs("waiter", "waiter2");
    const menuItem = await MenuItem.create({
      name: "Burger",
      category: "Main",
      price: 8,
      available: true,
    });
    const orderRes = await waiter
      .post("/api/v1/orders")
      .send({
        orderType: "dine-in",
        items: [{ menuItemId: menuItem._id.toString(), quantity: 1 }],
      });
    const orderId = orderRes.body.data._id;
    const confirmAttempt = await waiter.patch(
      `/api/v1/orders/${orderId}/confirm`,
    );
    expect(confirmAttempt.status).toBe(403);
  });
  it("rejects an invalid status jump (pending straight to served)", async () => {
    const waiter = await loginAs("waiter", "waiter3");
    const counter = await loginAs("counter", "counter3");
    const menuItem = await MenuItem.create({
      name: "Salad",
      category: "Starter",
      price: 5,
      available: true,
    });
    const orderRes = await waiter
      .post("/api/v1/orders")
      .send({
        orderType: "dine-in",
        items: [{ menuItemId: menuItem._id.toString(), quantity: 1 }],
      });
    const orderId = orderRes.body.data._id;
    const servedAttempt = await counter.patch(
      `/api/v1/orders/${orderId}/served`,
    );
    expect(servedAttempt.status).toBe(400);
    expect(servedAttempt.body.message).toMatch(/Cannot move order/);
  });
  it("walks the full valid lifecycle end to end", async () => {
    const waiter = await loginAs("waiter", "waiter4");
    const counter = await loginAs("counter", "counter4");
    const kitchen = await loginAs("kitchen", "kitchen4");
    const menuItem = await MenuItem.create({
      name: "Pasta",
      category: "Main",
      price: 12,
      available: true,
    });
    const orderRes = await waiter
      .post("/api/v1/orders")
      .send({
        orderType: "dine-in",
        items: [{ menuItemId: menuItem._id.toString(), quantity: 1 }],
      });
    const orderId = orderRes.body.data._id;
    await counter.patch(`/api/v1/orders/${orderId}/confirm`).expect(200);
    await kitchen
      .patch(`/api/v1/orders/${orderId}/kitchen-status`)
      .send({ status: "preparing" })
      .expect(200);
    await kitchen
      .patch(`/api/v1/orders/${orderId}/kitchen-status`)
      .send({ status: "ready" })
      .expect(200);
    const servedRes = await counter.patch(`/api/v1/orders/${orderId}/served`);
    expect(servedRes.status).toBe(200);
    expect(servedRes.body.data.status).toBe("served");
  });
  it("rejects an unauthenticated request", async () => {
    const res = await request(app).get("/api/v1/orders");
    expect(res.status).toBe(403);
  });
});
