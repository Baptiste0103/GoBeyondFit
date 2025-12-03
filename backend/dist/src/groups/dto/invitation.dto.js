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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RespondInvitationDto = exports.CreateInvitationDto = void 0;
const class_validator_1 = require("class-validator");
var InvitationStatus;
(function (InvitationStatus) {
    InvitationStatus["pending"] = "pending";
    InvitationStatus["accepted"] = "accepted";
    InvitationStatus["rejected"] = "rejected";
})(InvitationStatus || (InvitationStatus = {}));
class CreateInvitationDto {
    toUserId;
    groupId;
}
exports.CreateInvitationDto = CreateInvitationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvitationDto.prototype, "toUserId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvitationDto.prototype, "groupId", void 0);
class RespondInvitationDto {
    status;
}
exports.RespondInvitationDto = RespondInvitationDto;
__decorate([
    (0, class_validator_1.IsEnum)(InvitationStatus),
    __metadata("design:type", String)
], RespondInvitationDto.prototype, "status", void 0);
//# sourceMappingURL=invitation.dto.js.map