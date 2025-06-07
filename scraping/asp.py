from pydantic import BaseModel
from typing import List


class Comment(BaseModel):
    """
    Represents a comment on a social media post.
    """

    content: str


class AbstractSocialPost(BaseModel):
    """
    Abstract base class for social media posts.
    """

    id: str
    date: str
    description: str
    views: int
    shares: int
    comments: List[Comment]
