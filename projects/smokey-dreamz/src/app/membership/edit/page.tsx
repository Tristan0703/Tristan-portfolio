"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, CreditCard, ArrowLeft, Check, AlertCircle, Loader2 } from "lucide-react";
import { getMember, Member } from "@/components/membership";
import { requireSupabaseEnv } from "@/utils/supabase/env";

const { url: SUPABASE_URL, key: ANON_KEY } = requireSupabaseEnv();

export default function EditProfilePage() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contactNumber: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentMember = getMember();
    if (!currentMember) {
      router.push("/welcome");
      return;
    }
    setMember(currentMember);
    setFormData({
      name: currentMember.name,
      contactNumber: currentMember.contactNumber,
      email: currentMember.email,
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const cleanName = formData.name.trim().replace(/[^\p{L}\p{N}\s'\-.]/gu, '').trim();
    const cleanContact = formData.contactNumber.replace(/[^0-9+\-() ]/g, '');

    if (!cleanName || cleanName.length < 2) {
      setError("Please enter a valid name");
      setSaving(false);
      return;
    }

    try {
      const sessionKey = `sb-${encodeURIComponent(SUPABASE_URL)}-auth-token`;
      const stored = localStorage.getItem(sessionKey);
      const token = stored ? JSON.parse(stored).access_token : ANON_KEY;

      const response = await fetch(`${SUPABASE_URL}/rest/v1/members?id=eq.${member?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: cleanName,
          contact_number: cleanContact,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Update local storage
      if (member) {
        const updatedMember = {
          ...member,
          name: cleanName,
          contactNumber: cleanContact,
        };
        localStorage.setItem('smokey_dreamz_member', JSON.stringify(updatedMember));
        setMember(updatedMember);
      }

      setSuccess(true);
      setTimeout(() => router.push("/membership"), 1500);
    } catch (err) {
      setError("Failed to save changes. Please try again.");
    }

    setSaving(false);
  };

  if (!member) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.push("/membership")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-white mb-2">Edit Profile</h1>
          <p className="text-zinc-500">Update your member details</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Contact Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Email (Read Only)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full pl-12 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Membership ID</label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={member.membershipId}
                disabled
                className="w-full pl-12 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-500 cursor-not-allowed"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-950/30 border border-green-900/50 rounded-xl text-green-400 text-sm">
              <Check className="w-4 h-4 flex-shrink-0" />
              Profile updated successfully!
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 bg-gold hover:bg-gold-light text-black font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
