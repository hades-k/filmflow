import React, { useState, useEffect } from 'react';
import { Users, Plus, LogOut, Copy, Check, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  createHousehold, 
  joinHouseholdByCode, 
  leaveHousehold, 
  getHousehold,
  getHouseholdMembers,
  createUserProfile,
  getUserProfile,
  importPersonalSessionsToHousehold
} from '../services/householdService';
import { Household, UserProfile } from '../types';

interface HouseholdManagerProps {
  userId: string;
  userEmail: string;
  userDisplayName: string;
  onHouseholdChange: (householdId: string | null) => void;
}

export function HouseholdManager({ userId, userEmail, userDisplayName, onHouseholdChange }: HouseholdManagerProps) {
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadHouseholdData();
  }, [userId]);

  async function loadHouseholdData() {
    try {
      setLoading(true);
      
      // Ensure user profile exists
      await createUserProfile(userId, userEmail, userDisplayName);
      
      const profile = await getUserProfile(userId);
      if (profile?.householdId) {
        const householdData = await getHousehold(profile.householdId);
        if (householdData) {
          setHousehold(householdData);
          const membersData = await getHouseholdMembers(profile.householdId);
          setMembers(membersData);
          onHouseholdChange(profile.householdId);
        }
      } else {
        onHouseholdChange(null);
      }
    } catch (err) {
      console.error('Error loading household:', err);
      setError('Failed to load household data');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateHousehold() {
    if (!householdName.trim()) {
      setError('Please enter a household name');
      return;
    }

    try {
      setError(null);
      const householdId = await createHousehold(userId, householdName);
      await loadHouseholdData();
      setShowCreateForm(false);
      setHouseholdName('');
    } catch (err) {
      console.error('Error creating household:', err);
      setError('Failed to create household');
    }
  }

  async function handleJoinHousehold() {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    try {
      setError(null);
      await joinHouseholdByCode(userId, inviteCode);
      await loadHouseholdData();
      setShowJoinForm(false);
      setInviteCode('');
    } catch (err: any) {
      console.error('Error joining household:', err);
      setError(err.message || 'Failed to join household');
    }
  }

  async function handleLeaveHousehold() {
    if (!household) return;
    
    if (!confirm('Are you sure you want to leave this household? You will lose access to shared sessions.')) {
      return;
    }

    try {
      setError(null);
      await leaveHousehold(userId, household.id);
      setHousehold(null);
      setMembers([]);
      onHouseholdChange(null);
    } catch (err) {
      console.error('Error leaving household:', err);
      setError('Failed to leave household');
    }
  }

  function copyInviteCode() {
    if (household?.inviteCode) {
      navigator.clipboard.writeText(household.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleImportSessions() {
    if (!household) return;
    
    if (!confirm('Import all your personal sessions into this household? They will become visible to all household members.')) {
      return;
    }

    try {
      setImporting(true);
      setError(null);
      setImportSuccess(null);
      
      const count = await importPersonalSessionsToHousehold(userId, household.id);
      
      if (count > 0) {
        setImportSuccess(`Successfully imported ${count} session${count !== 1 ? 's' : ''} to household`);
        setTimeout(() => setImportSuccess(null), 5000);
        // Trigger a refresh by calling the callback
        onHouseholdChange(household.id);
      } else {
        setImportSuccess('No personal sessions found to import');
        setTimeout(() => setImportSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error importing sessions:', err);
      setError('Failed to import sessions');
    } finally {
      setImporting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <p className="text-accent/50 text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-900/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {importSuccess && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-900/30 rounded-lg text-green-400 text-sm">
          {importSuccess}
        </div>
      )}

      {household ? (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2 text-accent">{household.name}</h3>
            <div className="flex items-center gap-2 mb-4">
              <code className="bg-accent/10 px-3 py-1.5 rounded text-sm font-mono text-accent border border-accent/20">
                {household.inviteCode}
              </code>
              <button
                onClick={copyInviteCode}
                className="p-1.5 hover:bg-accent/10 rounded transition-colors border border-transparent hover:border-accent/20"
                title="Copy invite code"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-accent/60" />
                )}
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-accent/70 mb-2">
              Members ({members.length})
            </h4>
            <div className="space-y-2">
              {members.map(member => (
                <div key={member.id} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-accent/5 border border-accent/10">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center border border-accent/30">
                    <span className="text-accent font-medium text-xs">
                      {member.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-accent">{member.displayName}</div>
                    <div className="text-accent/50 text-xs">{member.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleImportSessions}
            disabled={importing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors border border-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            {importing ? 'Importing...' : 'Import Personal Sessions'}
          </button>

          <button
            onClick={handleLeaveHousehold}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors border border-red-900/30"
          >
            <LogOut className="w-4 h-4" />
            Leave Household
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-accent/60 text-sm mb-4">
            Create or join a household to share sessions with family members.
          </p>

          <AnimatePresence>
            {showCreateForm ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <input
                  type="text"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  placeholder="Household name"
                  className="w-full px-3 py-2 bg-bg border border-border text-accent rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-transparent"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateHousehold}
                    className="flex-1 px-4 py-2 bg-accent text-bg rounded-lg hover:bg-accent/90 transition-colors font-medium"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setHouseholdName('');
                      setError(null);
                    }}
                    className="px-4 py-2 bg-bg border border-border text-accent rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent text-bg rounded-lg hover:bg-accent/90 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Household
              </button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showJoinForm ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Enter invite code"
                  className="w-full px-3 py-2 bg-bg border border-border text-accent rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-transparent uppercase font-mono tracking-widest"
                  maxLength={6}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleJoinHousehold}
                    className="flex-1 px-4 py-2 bg-green-900/30 text-green-400 rounded-lg hover:bg-green-900/40 transition-colors font-medium border border-green-900/40"
                  >
                    Join
                  </button>
                  <button
                    onClick={() => {
                      setShowJoinForm(false);
                      setInviteCode('');
                      setError(null);
                    }}
                    className="px-4 py-2 bg-bg border border-border text-accent rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <button
                onClick={() => setShowJoinForm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-900/20 text-green-400 rounded-lg hover:bg-green-900/30 transition-colors border border-green-900/30 font-medium"
              >
                <Users className="w-4 h-4" />
                Join Household
              </button>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
