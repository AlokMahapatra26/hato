import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, username, email, password } = body;

    // Validate input
    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email or username already exists' },
        { status: 400 }
      );
    }

    // Hash password on server side
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
    };

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error: any) {
    console.error('User creation error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email or username already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error creating user: ' + error.message },
      { status: 500 }
    );
  }
}
