'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertCircle } from 'lucide-react';

interface DeleteAccountDialogProps {
  userId: string;
  username: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteAccountDialog({
  userId,
  username,
  open,
  onOpenChange,
}: DeleteAccountDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        // Sign out and redirect to login
        await signOut({ redirect: false });
        router.push('/login');
      } else {
        setError(data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove all your data including tweets, comments, and follows.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="confirm">
              Type <strong>DELETE</strong> to confirm
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setConfirmText('');
              setError('');
              onOpenChange(false);
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || confirmText !== 'DELETE'}
          >
            {loading ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
