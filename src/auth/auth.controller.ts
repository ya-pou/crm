import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthLoginDto } from './dto/authLogin.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiTags('Authentification')
  @Post('/login')
  async login(@Body() authDto: AuthLoginDto) {
    return await this.authService.login(authDto);
  }
}
