"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const testDb_1 = require("./testDb");
const user_model_1 = __importDefault(require("../src/app/modules/user/user.model"));
const menu_model_1 = __importDefault(require("../src/app/modules/menu/menu.model"));
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, testDb_1.connectTestDB)();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, testDb_1.disconnectTestDB)();
}));
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, testDb_1.clearTestDB)();
}));
const loginAs = (role, username) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_model_1.default.create({
        name: username,
        username,
        password: "password123",
        role,
    });
    const agent = supertest_1.default.agent(app_1.default);
    yield agent
        .post("/api/v1/auth/login")
        .send({ username, password: "password123" });
    return agent;
});
describe("Order lifecycle and state machine", () => {
    it("lets a waiter create a dine-in order, starting as pending", () => __awaiter(void 0, void 0, void 0, function* () {
        const waiter = yield loginAs("waiter", "waiter1");
        const menuItem = yield menu_model_1.default.create({
            name: "Pizza",
            category: "Main",
            price: 10,
            available: true,
        });
        const res = yield waiter
            .post("/api/v1/orders")
            .send({
            orderType: "dine-in",
            items: [{ menuItemId: menuItem._id.toString(), quantity: 2 }],
        });
        expect(res.status).toBe(201);
        expect(res.body.data.status).toBe("pending");
        expect(res.body.data.total).toBe(20);
    }));
    it("rejects a waiter trying to confirm their own order", () => __awaiter(void 0, void 0, void 0, function* () {
        const waiter = yield loginAs("waiter", "waiter2");
        const menuItem = yield menu_model_1.default.create({
            name: "Burger",
            category: "Main",
            price: 8,
            available: true,
        });
        const orderRes = yield waiter
            .post("/api/v1/orders")
            .send({
            orderType: "dine-in",
            items: [{ menuItemId: menuItem._id.toString(), quantity: 1 }],
        });
        const orderId = orderRes.body.data._id;
        const confirmAttempt = yield waiter.patch(`/api/v1/orders/${orderId}/confirm`);
        expect(confirmAttempt.status).toBe(403);
    }));
    it("rejects an invalid status jump (pending straight to served)", () => __awaiter(void 0, void 0, void 0, function* () {
        const waiter = yield loginAs("waiter", "waiter3");
        const counter = yield loginAs("counter", "counter3");
        const menuItem = yield menu_model_1.default.create({
            name: "Salad",
            category: "Starter",
            price: 5,
            available: true,
        });
        const orderRes = yield waiter
            .post("/api/v1/orders")
            .send({
            orderType: "dine-in",
            items: [{ menuItemId: menuItem._id.toString(), quantity: 1 }],
        });
        const orderId = orderRes.body.data._id;
        const servedAttempt = yield counter.patch(`/api/v1/orders/${orderId}/served`);
        expect(servedAttempt.status).toBe(400);
        expect(servedAttempt.body.message).toMatch(/Cannot move order/);
    }));
    it("walks the full valid lifecycle end to end", () => __awaiter(void 0, void 0, void 0, function* () {
        const waiter = yield loginAs("waiter", "waiter4");
        const counter = yield loginAs("counter", "counter4");
        const kitchen = yield loginAs("kitchen", "kitchen4");
        const menuItem = yield menu_model_1.default.create({
            name: "Pasta",
            category: "Main",
            price: 12,
            available: true,
        });
        const orderRes = yield waiter
            .post("/api/v1/orders")
            .send({
            orderType: "dine-in",
            items: [{ menuItemId: menuItem._id.toString(), quantity: 1 }],
        });
        const orderId = orderRes.body.data._id;
        yield counter.patch(`/api/v1/orders/${orderId}/confirm`).expect(200);
        yield kitchen
            .patch(`/api/v1/orders/${orderId}/kitchen-status`)
            .send({ status: "preparing" })
            .expect(200);
        yield kitchen
            .patch(`/api/v1/orders/${orderId}/kitchen-status`)
            .send({ status: "ready" })
            .expect(200);
        const servedRes = yield counter.patch(`/api/v1/orders/${orderId}/served`);
        expect(servedRes.status).toBe(200);
        expect(servedRes.body.data.status).toBe("served");
    }));
    it("rejects an unauthenticated request", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default).get("/api/v1/orders");
        expect(res.status).toBe(403);
    }));
});
