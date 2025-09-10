'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Star, 
  StarOff, 
  Edit3, 
  Save, 
  X as CloseIcon,
  Heart,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RuneContent } from '@/types/mystic';
import { RuneId } from '@/content/runes-ids';
import { getRuneFull } from '@/lib/content/runes';
import { useAuth } from '@/lib/auth/context';

interface RuneDetailDrawerProps {
  runeId: RuneId | null;
  isOpen: boolean;
  onClose: () => void;
  onRuneChange?: (runeId: RuneId) => void;
}

interface RuneNote {
  runeId: string;
  text: string;
  updatedAt: any;
}

export function RuneDetailDrawer({ 
  runeId, 
  isOpen, 
  onClose, 
  onRuneChange 
}: RuneDetailDrawerProps) {
  const { user } = useAuth();
  const [rune, setRune] = useState<RuneContent | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [note, setNote] = useState<RuneNote | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load rune data when runeId changes
  useEffect(() => {
    if (runeId) {
      const runeData = getRuneFull(runeId);
      setRune(runeData || null);
    } else {
      setRune(null);
    }
  }, [runeId]);

  // Load favorites and notes when rune changes
  useEffect(() => {
    if (runeId && user) {
      loadUserData();
    } else {
      setIsFavorite(false);
      setNote(null);
    }
  }, [runeId, user]);

  const loadUserData = async () => {
    if (!runeId || !user) return;
    
    setIsLoading(true);
    try {
      // Load favorites
      const { db } = await import('@/lib/firebase/client');
      const favoritesDoc = await db.collection('favorites_runes').doc(user.uid).get();
      setIsFavorite(favoritesDoc.exists && favoritesDoc.data()?.[runeId] === true);

      // Load note
      const noteDoc = await db.collection('rune_notes').doc(user.uid).collection('items').doc(runeId).get();
      if (noteDoc.exists) {
        setNote(noteDoc.data() as RuneNote);
        setNoteText(noteDoc.data()?.text || '');
      } else {
        setNote(null);
        setNoteText('');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!runeId || !user) return;

    try {
      const newFavoriteStatus = !isFavorite;
      const { db } = await import('@/lib/firebase/client');
      await db.collection('favorites_runes').doc(user.uid).set({
        [runeId]: newFavoriteStatus
      }, { merge: true });
      setIsFavorite(newFavoriteStatus);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const saveNote = async () => {
    if (!runeId || !user) return;

    try {
      const noteData = {
        runeId,
        text: noteText.trim(),
        updatedAt: new Date()
      };

      const { db } = await import('@/lib/firebase/client');
      await db.collection('rune_notes').doc(user.uid).collection('items').doc(runeId).set(noteData);

      setNote(noteData);
      setIsEditingNote(false);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const deleteNote = async () => {
    if (!runeId || !user) return;

    try {
      const { db } = await import('@/lib/firebase/client');
      await db.collection('rune_notes').doc(user.uid).collection('items').doc(runeId).delete();

      setNote(null);
      setNoteText('');
      setIsEditingNote(false);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  if (!rune) return null;

  const hasReversed = rune.reversed && rune.reversed.trim() !== '';
  const hasInfo = rune.info && rune.info.trim() !== '';
  const hasKeywords = rune.keywords && rune.keywords.length > 0;
  const hasHistory = rune.history && rune.history.trim() !== '';
  const hasAdvice = rune.advice && rune.advice.trim() !== '';
  const hasShadow = rune.shadow && rune.shadow.trim() !== '';
  const hasRitualIdeas = rune.ritualIdeas && rune.ritualIdeas.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ 
              x: '100%',
              y: '100%'
            }}
            animate={{ 
              x: 0,
              y: 0
            }}
            exit={{ 
              x: '100%',
              y: '100%'
            }}
            transition={{ 
              type: 'spring',
              damping: 30,
              stiffness: 300
            }}
            className={cn(
              'fixed z-50 bg-card border-border shadow-2xl',
              // Mobile: bottom sheet
              'bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl',
              // Desktop: side panel
              'md:bottom-auto md:top-0 md:right-0 md:left-auto md:w-96 md:max-h-screen md:rounded-none md:border-l'
            )}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <CardHeader className="flex-shrink-0 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span 
                      className="text-3xl font-cinzel"
                      style={{ fontFamily: 'var(--font-cinzel)' }}
                    >
                      {rune.symbol}
                    </span>
                    <div>
                      <CardTitle className="text-xl">{rune.name}</CardTitle>
                      {rune.phoneme && (
                        <p className="text-sm text-muted-foreground">
                          Phoneme: <span className="text-yellow-400">{rune.phoneme}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {user && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleFavorite}
                        className={cn(
                          'text-yellow-400 hover:text-yellow-300',
                          isFavorite && 'text-yellow-300'
                        )}
                      >
                        {isFavorite ? <Star className="h-5 w-5 fill-current" /> : <StarOff className="h-5 w-5" />}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Content */}
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Basic Meanings */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-yellow-400" />
                      Upright
                    </h3>
                    <p className="text-muted-foreground">{rune.upright}</p>
                  </div>

                  {hasReversed && (
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Reversed
                      </h3>
                      <p className="text-yellow-400/80 italic">{rune.reversed}</p>
                    </div>
                  )}
                </div>

                {/* Keywords */}
                {hasKeywords && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                      Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {rune.keywords!.map((keyword, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                {hasInfo && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-yellow-400" />
                      Details
                    </h3>
                    <p className="text-muted-foreground">{rune.info}</p>
                  </div>
                )}

                {/* Lore Sections */}
                {hasHistory && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">History & Lore</h3>
                    <p className="text-muted-foreground">{rune.history}</p>
                  </div>
                )}

                {hasAdvice && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-400" />
                      Practical Advice
                    </h3>
                    <p className="text-muted-foreground">{rune.advice}</p>
                  </div>
                )}

                {hasShadow && (
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Shadow Aspects
                    </h3>
                    <p className="text-yellow-400/80">{rune.shadow}</p>
                  </div>
                )}

                {hasRitualIdeas && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Ritual Ideas</h3>
                    <ul className="space-y-2">
                      {rune.ritualIdeas!.map((idea, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          <span className="text-muted-foreground">{idea}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Personal Notes */}
                {user && (
                  <div>
                    <Separator className="my-6" />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">Personal Notes</h3>
                        {!isEditingNote && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingNote(true)}
                            className="text-yellow-400 hover:text-yellow-300"
                          >
                            <Edit3 className="h-4 w-4 mr-1" />
                            {note ? 'Edit' : 'Add Note'}
                          </Button>
                        )}
                      </div>

                      {isEditingNote ? (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="note-text">Your thoughts on {rune.name}</Label>
                            <Input
                              id="note-text"
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Add your personal insights, experiences, or interpretations..."
                              className="mt-1"
                              maxLength={2000}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {noteText.length}/2000 characters
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={saveNote}
                              size="sm"
                              className="bg-yellow-500 hover:bg-yellow-600 text-black"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setIsEditingNote(false);
                                setNoteText(note?.text || '');
                              }}
                            >
                              Cancel
                            </Button>
                            {note && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={deleteNote}
                                className="text-red-400 hover:text-red-300"
                              >
                                <CloseIcon className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="min-h-[100px] p-4 rounded-lg border border-border bg-card/50">
                          {note ? (
                            <p className="text-muted-foreground whitespace-pre-wrap">{note.text}</p>
                          ) : (
                            <p className="text-muted-foreground italic">
                              No personal notes yet. Click "Add Note" to record your thoughts about this rune.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {rune.element && (
                      <div>
                        <span className="text-muted-foreground">Element:</span>
                        <span className="text-yellow-400 ml-2 capitalize">{rune.element}</span>
                      </div>
                    )}
                    {rune.altNames && rune.altNames.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Alt. Names:</span>
                        <span className="text-yellow-400 ml-2">{rune.altNames.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}