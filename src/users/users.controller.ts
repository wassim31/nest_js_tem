import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { BadRequestResponseDto } from '../auth/dto/auth-response.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly users: UsersService) { }

    @ApiOperation({
        summary: 'Create a new user',
        description: 'Creates a new user account (alternative endpoint to auth/register)',
    })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({
        status: 201,
        description: 'User successfully created',
        type: UserResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed or user already exists',
        type: BadRequestResponseDto,
    })
    // Registration (we'll also expose via /auth/register later to keep auth concerns together)
    @Post()
    create(@Body() dto: CreateUserDto) {
        return this.users.create(dto);
    }

    @ApiOperation({
        summary: 'Get user by ID',
        description: 'Retrieves a specific user by their ID',
    })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        type: 'integer',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'User found',
        type: UserResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
    })
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.users.findById(id.toString());
    }

    @ApiOperation({
        summary: 'Update user',
        description: 'Updates user information by ID',
    })
    @ApiParam({
        name: 'id',
        description: 'User ID to update',
        type: 'integer',
        example: 1,
    })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({
        status: 200,
        description: 'User successfully updated',
        type: UserResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Validation failed',
        type: BadRequestResponseDto,
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
    })
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserDto,
    ) {
        return this.users.update(id.toString(), dto);
    }

    @ApiOperation({
        summary: 'Delete user',
        description: 'Deletes a user by ID',
    })
    @ApiParam({
        name: 'id',
        description: 'User ID to delete',
        type: 'integer',
        example: 1,
    })
    @ApiResponse({
        status: 200,
        description: 'User successfully deleted',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'User deleted successfully',
                },
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
    })
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.users.remove(id.toString());
    }
}
