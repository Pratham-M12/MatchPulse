import { useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { MatchCard } from '@/components/match/MatchCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';
import type { Match } from '@/types/football';

type MatchListProps = {
  title: string;
  subtitle?: string;
  matches: Match[];
  emptyMessage?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  onMatchPress?: (match: Match) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
};

const SIDE_PADDING = spacing.base;
const CARD_GAP = spacing.md;
const CARD_WIDTH_RATIO = 0.78;
const MAX_CARD_WIDTH = 300;

/*
 * Large enough to comfortably display team names and scores,
 * while still exposing part of the next card as a carousel hint.
 */
export function MatchList({
  title,
  subtitle,
  matches,
  emptyMessage = 'No matches to show right now.',
  actionLabel,
  onActionPress,
  onMatchPress,
  isLoading = false,
  isError = false,
  errorMessage = 'Unable to load matches.',
  onRetry,
}: MatchListProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState<number>();
  const availableWidth = containerWidth ?? windowWidth;
  const cardWidth = Math.min(availableWidth * CARD_WIDTH_RATIO, MAX_CARD_WIDTH);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;

    const index = Math.round(offsetX / (cardWidth + CARD_GAP));

    const clampedIndex = Math.max(
      0,
      Math.min(index, Math.max(matches.length - 1, 0)),
    );

    if (clampedIndex !== activeIndex) {
      setActiveIndex(clampedIndex);
    }
  };

  return (
    <View
      onLayout={(event) => {
        const nextWidth = event.nativeEvent.layout.width;
        setContainerWidth((currentWidth) => currentWidth === nextWidth ? currentWidth : nextWidth);
      }}
      style={{ gap: spacing.md }}
    >
      {/* SECTION HEADER */}
      <View style={{ paddingHorizontal: SIDE_PADDING, gap: subtitle ? 4 : 0 }}>
        <SectionTitle
          title={title}
          actionLabel={actionLabel}
          onActionPress={onActionPress}
          actionTouchTarget
        />
        {subtitle ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary }} />
            <Typography variant="caption" color="textSecondary">{subtitle}</Typography>
          </View>
        ) : null}
      </View>

      {/* LOADING */}
      {isLoading ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: SIDE_PADDING,
            paddingRight: SIDE_PADDING,
            gap: CARD_GAP,
          }}
        >
          {[0, 1].map((index) => (
            <View
              key={index}
              accessibilityLabel="Loading match"
              style={{
                width: cardWidth,
                height: 190,
                borderRadius: radius.card,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing.base,
                gap: spacing.md,
              }}
            >
              <View
                style={{
                  width: '48%',
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: colors.surfaceHighlight,
                }}
              />

              <View
                style={{
                  width: '100%',
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: colors.surfaceHighlight,
                }}
              />

              <View
                style={{
                  width: '62%',
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: colors.surfaceHighlight,
                }}
              />
            </View>
          ))}
        </ScrollView>
      ) : isError ? (
        /* ERROR */
        <View style={{ paddingHorizontal: SIDE_PADDING }}>
          <ErrorState
            message={errorMessage}
            onRetry={onRetry}
          />
        </View>
      ) : matches.length === 0 ? (
        /* EMPTY */
        <View style={{ paddingHorizontal: SIDE_PADDING }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
              paddingVertical: spacing.lg,
              paddingHorizontal: spacing.base,
              backgroundColor: colors.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.divider,
            }}
          >
            <Ionicons name="football-outline" size={18} color={colors.textDisabled} />
            <Typography
              variant="body"
              color="textSecondary"
              style={{ textAlign: 'center' }}
            >
              {emptyMessage}
            </Typography>
          </View>
        </View>
      ) : (
        <>
          {/* MATCH CAROUSEL */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={cardWidth + CARD_GAP}
            snapToAlignment="start"
            contentContainerStyle={{
              paddingLeft: SIDE_PADDING,
              paddingRight: SIDE_PADDING,
              gap: CARD_GAP,
            }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {matches.map((match) => (
              <View
                key={match.id}
                style={{
                  width: cardWidth,
                }}
              >
                <MatchCard
                  match={match}
                  fullWidth
                  showNavigationAffordance
                  onPress={() => onMatchPress?.(match)}
                />
              </View>
            ))}
          </ScrollView>

          {/* PAGINATION */}
          {matches.length > 1 ? (
            <View
              accessibilityLabel={`Slide ${activeIndex + 1} of ${matches.length}`}
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: spacing.xs,
              }}
            >
              {matches.map((match, index) => (
                <View
                  key={match.id}
                  style={{
                    width: index === activeIndex ? 18 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor:
                      index === activeIndex
                        ? colors.primary
                        : colors.surfaceHighlight,
                  }}
                />
              ))}
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}
