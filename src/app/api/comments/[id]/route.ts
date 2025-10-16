import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Comment from '@/lib/models/Comment';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    await dbConnect();
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.author.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await comment.deleteOne();
    return NextResponse.json({ message: 'Comment deleted' });
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Error deleting comment' }, { status: 500 });
  }
}
