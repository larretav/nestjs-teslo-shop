import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { IJwtPayload } from "../interfaces/jwt-payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    configService: ConfigService
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // ignoreExpiration: false,
    });
  }

  async validate(payload: IJwtPayload): Promise<User> {

    const { email } = payload;

    const user = await this.userRepository.findOneBy({ email });

    if (!user)
      throw new UnauthorizedException('Token no válido');

    if (!user.isActive)
      throw new UnauthorizedException('El usuario esta inactivo, comuniquese con el administrador');

    return user;
  }

}