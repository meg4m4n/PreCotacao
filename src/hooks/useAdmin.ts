import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  is_admin: boolean;
}

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkAdminStatus = async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data?.is_admin ?? false);
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, [user]);

  const fetchUsers = async () => {
    if (!isAdmin) return;

    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select(`
        user_id,
        is_admin,
        auth_user:user_id (
          id,
          email,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (adminError) {
      console.error('Error fetching users:', adminError);
      return;
    }

    const formattedUsers: AdminUser[] = adminData.map(u => ({
      id: u.user_id,
      email: u.auth_user.email,
      created_at: u.auth_user.created_at,
      is_admin: u.is_admin,
    }));

    setUsers(formattedUsers);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const createUser = async (email: string, password: string, isAdmin: boolean) => {
    if (!user) return;

    // Create the user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Error creating user:', authError);
      throw authError;
    }

    // Add user to admin_users table
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        user_id: authData.user.id,
        is_admin: isAdmin,
      });

    if (adminError) {
      console.error('Error adding admin user:', adminError);
      throw adminError;
    }

    await fetchUsers();
  };

  const updateUser = async (userId: string, isAdmin: boolean) => {
    const { error } = await supabase
      .from('admin_users')
      .update({ is_admin: isAdmin })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    await fetchUsers();
  };

  const deleteUser = async (userId: string) => {
    // Delete from Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Error deleting user:', authError);
      throw authError;
    }

    await fetchUsers();
  };

  return {
    isAdmin,
    users,
    loading,
    createUser,
    updateUser,
    deleteUser,
  };
}