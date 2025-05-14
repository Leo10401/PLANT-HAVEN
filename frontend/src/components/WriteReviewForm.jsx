"use client";

import React, { useState } from 'react';
import { Star, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { addReview } from '@/services/api';
import { toast } from 'react-hot-toast';

const WriteReviewForm = ({ productId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    if (title.trim() === '') {
      toast.error('Please enter a review title');
      return;
    }
    
    if (comment.trim() === '') {
      toast.error('Please enter your review');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reviewData = {
        product: productId,
        rating,
        title,
        comment
      };
      
      await addReview(productId, reviewData);
      toast.success('Your review has been submitted!');
      
      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      
      // Notify parent component of success
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit}>
        {/* Rating */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Your Rating*</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  className={`h-8 w-8 ${
                    (hoverRating || rating) >= star
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="text-sm mt-1 text-gray-500">
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Average"}
            {rating === 4 && "Good"}
            {rating === 5 && "Excellent"}
          </div>
        </div>
        
        {/* Review Title */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Review Title*
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            required
          />
        </div>
        
        {/* Review Comment */}
        <div className="mb-6">
          <label htmlFor="comment" className="block text-sm font-medium mb-2">
            Your Review*
          </label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like or dislike about this product?"
            rows={5}
            required
          />
        </div>
        
        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </Button>
      </form>
    </div>
  );
};

export default WriteReviewForm; 