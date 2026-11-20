import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { NewsCard } from '@/components/home/NewsCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Typography } from '@/components/ui/Typography';
import { useFootballNews } from '@/hooks/useFootballNews';
import { isQuotaError, isUnsupportedEndpoint } from '@/lib/api/errors';
import { colors, radius, spacing } from '@/theme';

export function HomeNewsSection() {
  const { data: news = [], isLoading, isError, error, refetch } = useFootballNews(5);

  let errorMessage = 'Unable to load football news right now.';
  if (isUnsupportedEndpoint(error) || isQuotaError(error)) {
    errorMessage = 'Football news is currently unavailable.';
  }

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ paddingHorizontal: spacing.base }}>
        <SectionTitle title='Football News' />
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: spacing.base, gap: spacing.sm }}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              accessibilityLabel='Loading news article'
              style={{
                height: i === 0 ? 216 : 92,
                borderRadius: radius.card,
                backgroundColor: i === 0 ? colors.surfaceElevated : colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing.md,
                gap: spacing.xs,
                justifyContent: i === 0 ? 'flex-end' : 'center',
              }}
            >
              {i === 0 ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 132,
                    borderTopLeftRadius: radius.card,
                    borderTopRightRadius: radius.card,
                    backgroundColor: colors.surfaceHighlight,
                  }}
                />
              ) : null}
              <View
                style={{
                  width: '85%',
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: colors.surfaceHighlight,
                }}
              />
              <View
                style={{
                  width: '50%',
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: colors.surfaceHighlight,
                }}
              />
            </View>
          ))}
        </View>
      ) : isError ? (
        <View style={{ paddingHorizontal: spacing.base }}>
          <ErrorState message={errorMessage} onRetry={() => refetch()} />
        </View>
      ) : news.length === 0 ? (
        <View style={{ paddingHorizontal: spacing.base }}>
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
            <Ionicons name='newspaper-outline' size={18} color={colors.textDisabled} />
            <Typography variant='body' color='textSecondary' style={{ textAlign: 'center' }}>
              No football news stories right now.
            </Typography>
          </View>
        </View>
      ) : (
        <View style={{ paddingHorizontal: spacing.base, gap: spacing.sm }}>
          {news.map((article, index) => (
            <NewsCard key={article.id} article={article} variant={index === 0 ? 'lead' : 'standard'} />
          ))}
        </View>
      )}
    </View>
  );
}
