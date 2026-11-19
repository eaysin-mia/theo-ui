"use client";

import { useState } from "react";
import { Rating } from "theoui/components/rating";
import { Button } from "theoui/components/button";
import { Card, CardPanel } from "theoui/components/card";
import { Label } from "theoui/components/label";
import { Textarea } from "theoui/components/textarea";

export function Pattern() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  return (
    <Card className="mx-auto w-full max-w-xs">
      <CardPanel className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3">
          <h3 className="text-sm font-semibold">Write a Review</h3>
          <Rating rating={rating} onRatingChange={setRating} editable />
          {rating > 0 && (
            <p className="text-xs text-muted-foreground">
              {rating <= 2
                ? "We're sorry to hear that"
                : rating <= 3
                  ? "Thanks for your feedback"
                  : "Glad you enjoyed it!"}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="review-text" className="text-sm">
            Your review
          </Label>
          <Textarea
            id="review-text"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Tell us what you think..."
            rows={3}
          />
        </div>

        <Button disabled={rating === 0} size="sm" className="w-full">
          Submit Review
        </Button>
      </CardPanel>
    </Card>
  );
}
