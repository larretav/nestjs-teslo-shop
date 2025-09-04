import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt'
import { LoginUserDto } from './dto/login-user.dto';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private jwtService: JwtService

  ) { }

  async create(createAuthDto: CreateUserDto) {

    try {

      const { password, ...restCreateAuthDto } = createAuthDto;

      const user = this.userRepository.create({
        ...restCreateAuthDto,
        password: bcrypt.hashSync(password, 10)
      });

      await this.userRepository.save(user);

      delete user.password;

      // Retornar el JWT
      return {
        ...user,
        access_token: this.generateJwtToken({ id: user.id })
      }
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
      }
    });

    if (!user)
      throw new UnauthorizedException('Credenciales no válidas');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credenciales no válidas');

    // Retornar el JWT
    return {
      ...user,
      access_token: this.generateJwtToken({ id: user.id })
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  private generateJwtToken(payload: IJwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }


  private handleDBErrors(error: any): never {

    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    console.log(error);

    throw new InternalServerErrorException('Please check server logs');

  }
}


