import "reflect-metadata";
import { container } from "tsyringe";
import { UserRepository } from "../../modules/user/repositories/user.repo";
import { UserService } from "../../modules/user/services/user.service";
import { UserController } from "../../modules/user/controllers/user.controller";

container.registerSingleton(UserRepository);
container.registerSingleton(UserService);
container.registerSingleton(UserController);

export { container };