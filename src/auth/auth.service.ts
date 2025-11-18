import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { Request, Response } from 'express';
import { JwtPayload } from './types/jwt-payload.type';
import { verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.getByEmail(email);
    const isValid = await verify(user.password, password);

    if (!isValid) {
      throw new UnauthorizedException('Невірний пароль.');
    }

    return user;
  }

  async login(dto: LoginDto, response: Response, request: Request) {
    const user = await this.validateUser(dto.email, dto.password);

    const payload: JwtPayload = { sub: user.id, role: user.role };

    const { accessToken, refreshToken } = await this.generateTokens(
      payload,
      request,
    );

    this.setCookie(
      response,
      'refresh_token',
      refreshToken,
      new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
    );

    return response.json({ access_token: accessToken });
  }

  async register(dto: RegisterDto, response: Response, request: Request) {
    const user = await this.userService.create(dto);

    const payload: JwtPayload = { sub: user.id, role: user.role };

    const { accessToken, refreshToken } = await this.generateTokens(
      payload,
      request,
    );

    this.setCookie(
      response,
      'refresh_token',
      refreshToken,
      new Date(new Date(Date.now() + 31 * 24 * 60 * 60 * 1000)),
    );

    response.json({ access_token: accessToken });
  }

  async refresh(response: Response, request: Request) {
    const refreshToken = request.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('');
    }

    const refreshPayload: { sub: string; userAgent: string } =
      await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>(
          'JWT_REFRESH_TOKEN_SECRET',
        ),
      });

    if (refreshPayload.userAgent !== request.headers['user-agent']) {
      throw new UnauthorizedException('');
    }

    const user = await this.userService.getById(refreshPayload.sub);

    const payload: JwtPayload = { sub: user.id, role: user.role };

    const { accessToken } = await this.generateTokens(payload);

    return response.json({ access_token: accessToken });
  }

  async generateTokens(payload: JwtPayload, request?: Request) {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: '31d',
    });
    const refreshToken = await this.jwtService.signAsync(
      { sub: payload.sub, userAgent: request?.headers['user-agent'] },
      {
        secret: this.configService.getOrThrow<string>(
          'JWT_REFRESH_TOKEN_SECRET',
        ),
        expiresIn: '31d',
      },
    );

    return { accessToken, refreshToken };
  }

  logout(response: Response) {
    response.clearCookie('refresh_token');
    response.sendStatus(200);
  }

  setCookie(response: Response, key: string, token: string, expires: Date) {
    response.cookie(key, token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires,
    });
  }
}
