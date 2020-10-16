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
exports.UserModel = void 0;
const typeorm_1 = require("typeorm");
const story_model_1 = require("./story.model");
let UserModel = class UserModel extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], UserModel.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], UserModel.prototype, "email", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], UserModel.prototype, "password", void 0);
__decorate([
    typeorm_1.Column('bool', { default: false }),
    __metadata("design:type", Boolean)
], UserModel.prototype, "verified", void 0);
__decorate([
    typeorm_1.Column('numeric', { default: 0 }),
    __metadata("design:type", Number)
], UserModel.prototype, "role", void 0);
__decorate([
    typeorm_1.OneToMany(() => story_model_1.Story, (story) => story.creator),
    __metadata("design:type", Array)
], UserModel.prototype, "stories", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], UserModel.prototype, "createdAt", void 0);
__decorate([
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], UserModel.prototype, "updatedAt", void 0);
UserModel = __decorate([
    typeorm_1.Entity()
], UserModel);
exports.UserModel = UserModel;
//# sourceMappingURL=users.model.js.map