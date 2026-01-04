-- Add referral_person_id column to commissions table
ALTER TABLE commissions ADD COLUMN referral_person_id INTEGER REFERENCES referral_persons(id);
