"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async searchByEmail(email, pseudo) {
        if (pseudo && pseudo.trim()) {
            const user = await this.usersService.findByPseudoOrNull(pseudo.trim());
            if (!user) {
                return { found: false, data: null };
            }
            return { found: true, data: user };
        }
        if (email && email.trim()) {
            try {
                const user = await this.usersService.findByEmail(email.trim());
                return { found: true, data: user };
            }
            catch (error) {
                return { found: false, data: null };
            }
        }
        throw new common_1.BadRequestException('Either email or pseudo is required');
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('users'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)('email')),
    __param(1, (0, common_1.Query)('pseudo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "searchByEmail", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('search'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map