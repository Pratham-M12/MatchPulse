import { useState } from 'react';
import { Image, Linking, Pressable, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/theme';
import type { NewsItem } from '@/types/football';

type NewsCardProps = {
  article: NewsItem;
};

function formatArticleTime(isoDate?: string): string {
  if (!isoDate) return '';
  const timestamp = new Date(isoDate).getTime();
  if (isNaN(timestamp)) return '';
  const diffMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60_000));
  if (diffMinutes < 60) return diffMinutes <= 1 ? 'Just now' : String(diffMinutes) + 'm ago';
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return String(diffHours) + 'h ago';
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return String(diffDays) + 'd ago';
  return new Date(isoDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function NewsCard({ article }: NewsCardProps) {
  const [imageError, setImageError] = useState(false);

  const handlePress = async () => {
    if (!article.url) return;
    try {
      const supported = await Linking.canOpenURL(article.url);
      if (supported) {
        await Linking.openURL(article.url);
      }
    } catch {
      // In case device or URL scheme fails, do not crash
    }
  };

  const timeLabel = formatArticleTime(article.publishedAt);
  const showImage = Boolean(article.imageUrl && !imageError);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole='link'
      accessibilityLabel={article.title}
      accessibilityHint='Opens full article in web browser'
      style={({ pressed }) => ({
        backgroundColor: colors.surface,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        gap: spacing.sm,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: spacing.xs }}>
          <Typography variant='label' numberOfLines={2}>
            {article.title}
          </Typography>

          {article.summary ? (
            <Typography variant='caption' color='textSecondary' numberOfLines={2}>
              {article.summary}
            </Typography>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs }}>
            <Typography variant='caption' color='primary' numberOfLines={1}>
              {article.source}
            </Typography>
            {timeLabel ? (
              <>
                <Typography variant='caption' color='textDisabled'>
                  •
                </Typography>
                <Typography variant='caption' color='textSecondary'>
                  {timeLabel}
                </Typography>
              </>
            ) : null}
          </View>
        </View>

        {showImage ? (
          <Image
            source={{ uri: article.imageUrl }}
            style={{
              width: 72,
              height: 72,
              borderRadius: radius.md,
              backgroundColor: colors.surfaceHighlight,
            }}
            resizeMode='cover'
            onError={() => setImageError(true)}
          />
        ) : null}
      </View>
    </Pressable>
  );
}
