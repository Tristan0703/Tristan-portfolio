export interface MemberRow {
  id: string;
  membership_id: string;
  name: string;
  email: string;
  id_number: string;
  contact_number: string;
  created_at: string;
}

export interface Member {
  id: string;
  membershipId: string;
  name: string;
  email: string;
  idNumber: string;
  contactNumber: string;
  createdAt: string;
}

export function memberFromRow(row: MemberRow): Member {
  return {
    id: row.id,
    membershipId: row.membership_id,
    name: row.name,
    email: row.email,
    idNumber: row.id_number,
    contactNumber: row.contact_number,
    createdAt: row.created_at,
  };
}
