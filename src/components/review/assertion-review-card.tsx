'use client';

import type { AssertionDto, EvidenceDto } from '@ai-vantage/contracts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = {
  candidate: '待审核',
  verified: '已核实',
  active: '已生效',
  rejected: '已拒绝',
  deprecated: '已废弃',
  extracted: '已抽取',
};

interface AssertionReviewCardProps {
  assertion: AssertionDto;
  evidences: EvidenceDto[];
  conflictHint?: string;
  selected?: boolean;
  loading?: boolean;
  onSelect: () => void;
  onVerify: () => void;
  onReject: () => void;
  onDeprecate: () => void;
}

export function AssertionReviewCard({
  assertion,
  evidences,
  conflictHint,
  selected,
  loading,
  onSelect,
  onVerify,
  onReject,
  onDeprecate,
}: AssertionReviewCardProps) {
  const canReview =
    assertion.status === 'candidate' ||
    assertion.status === 'verified' ||
    assertion.status === 'extracted';

  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors',
        selected && 'ring-2 ring-blue-500/60',
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-snug">
            {assertion.claimText}
          </CardTitle>
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            {STATUS_LABELS[assertion.status] ?? assertion.status}
          </Badge>
        </div>
        {conflictHint && (
          <p className="text-xs text-orange-600 dark:text-orange-400">{conflictHint}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {assertion.subjectName ?? assertion.subjectEntityId}
          {assertion.objectName || assertion.objectEntityId
            ? ` → ${assertion.objectName ?? assertion.objectEntityId}`
            : ''}
          {' · '}
          置信度 {(assertion.confidence * 100).toFixed(0)}%
        </p>
      </CardHeader>
      {evidences.length > 0 && (
        <CardContent className="pt-0 text-xs text-muted-foreground space-y-1">
          {evidences.map((ev) => (
            <p key={ev.id} className="line-clamp-2">
              <span className="font-medium text-foreground">{ev.sourceTitle}</span>
              {ev.evidenceSpan ? ` — ${ev.evidenceSpan}` : ''}
            </p>
          ))}
        </CardContent>
      )}
      {canReview && (
        <CardFooter className="gap-2 pt-0" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" disabled={loading} onClick={onVerify}>
            {assertion.status === 'verified' ? '生效' : '通过'}
          </Button>
          <Button size="sm" variant="outline" disabled={loading} onClick={onReject}>
            拒绝
          </Button>
          <Button size="sm" variant="ghost" disabled={loading} onClick={onDeprecate}>
            废弃
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
