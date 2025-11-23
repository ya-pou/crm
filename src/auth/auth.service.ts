import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';

export type Payload = {
  email: string;
  sub: string;
  profil: string;
};
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(mail: string, pass: string): Promise<User> {
    const user = await this.usersService.findOneByMail(mail);
    if (!user) {
      throw new UnauthorizedException('Invalid credential');
    }
    const isMatchPassword = await bcrypt.compare(pass, user.password);
    if (!isMatchPassword) {
      throw new UnauthorizedException('Invalid credential');
    }
    return user;
  }

  async login(user: Partial<User>) {
    const logInUser = await this.validateUser(user.email, user.password);
    console.log(logInUser);
    if (logInUser) {
      const payload = {
        email: logInUser.email,
        sub: logInUser.id,
        profil: logInUser.profil,
      };
      return {
        access_token: this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
        }),
        // payload,
      };
    }
    return null;
  }
}
