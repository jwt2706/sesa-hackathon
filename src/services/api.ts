import { supabase } from '../lib/supabase';
import { Profile, Listing, Application, Group, ListingFilters } from '../types/database';

export const profileService = {
  async updateProfile(updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', (await supabase.auth.getUser()).data.user?.id!)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data as Profile | null;
  },
};

export const groupService = {
  async createGroup(name: string) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Not authenticated');

    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({ name, created_by: user.id })
      .select()
      .single();

    if (groupError) throw groupError;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ group_id: group.id })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return group as Group;
  },

  async joinGroup(groupId: string) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({ group_id: groupId })
      .eq('id', user.id);

    if (error) throw error;
  },

  async leaveGroup() {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({ group_id: null })
      .eq('id', user.id);

    if (error) throw error;
  },

  async getGroupMembers(groupId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('group_id', groupId);

    if (error) throw error;
    return data as Profile[];
  },
};

export const listingService = {
  async getListings(filters?: ListingFilters) {
    let query = supabase.from('listings').select('*');

    if (filters?.priceMin !== undefined) {
      query = query.gte('price', filters.priceMin);
    }
    if (filters?.priceMax !== undefined) {
      query = query.lte('price', filters.priceMax);
    }
    if (filters?.bedrooms !== undefined) {
      query = query.eq('bedrooms', filters.bedrooms);
    }
    if (filters?.bathrooms !== undefined) {
      query = query.eq('bathrooms', filters.bathrooms);
    }
    if (filters?.isOnCampus !== undefined) {
      query = query.eq('is_on_campus', filters.isOnCampus);
    }
    if (filters?.genderPreference && filters.genderPreference !== 'any') {
      query = query.eq('gender_preference', filters.genderPreference);
    }
    if (filters?.rentalType && filters.rentalType.length > 0) {
      query = query.in('rental_type', filters.rentalType);
    }
    if (filters?.amenities && filters.amenities.length > 0) {
      query = query.contains('amenities', filters.amenities);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data as Listing[];
  },

  async getListing(listingId: string) {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .maybeSingle();

    if (error) throw error;
    return data as Listing | null;
  },

  async createListing(listing: Omit<Listing, 'id' | 'landlord_id' | 'created_at' | 'updated_at'>) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('listings')
      .insert({ ...listing, landlord_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data as Listing;
  },

  async updateListing(listingId: string, updates: Partial<Listing>) {
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', listingId)
      .select()
      .single();

    if (error) throw error;
    return data as Listing;
  },

  async deleteListing(listingId: string) {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId);

    if (error) throw error;
  },

  async getLandlordListings() {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('landlord_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Listing[];
  },
};

export const applicationService = {
  async createApplication(listingId: string, groupId: string | null, message: string) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('applications')
      .insert({
        listing_id: listingId,
        applicant_id: user.id,
        group_id: groupId,
        message,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Application;
  },

  async getMyApplications() {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('applications')
      .select('*, listings(*)')
      .eq('applicant_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getApplicationsForListing(listingId: string) {
    const { data, error } = await supabase
      .from('applications')
      .select('*, profiles(*)')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getApplicationsForLandlord() {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('applications')
      .select('*, listings!inner(*), profiles(*)')
      .eq('listings.landlord_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateApplicationStatus(applicationId: string, status: 'pending' | 'accepted' | 'rejected') {
    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data as Application;
  },

  async deleteApplication(applicationId: string) {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId);

    if (error) throw error;
  },
};
