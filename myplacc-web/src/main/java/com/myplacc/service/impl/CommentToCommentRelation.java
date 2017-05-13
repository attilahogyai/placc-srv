package com.myplacc.service.impl;

import org.springframework.stereotype.Component;

import com.myplacc.domain.comment.Comment;

import io.katharsis.queryspec.QuerySpec;
import io.katharsis.repository.RelationshipRepositoryV2;
import io.katharsis.resource.list.ResourceList;
@Component(value="commentToCommentRelation")
public class CommentToCommentRelation implements RelationshipRepositoryV2<Comment, Long, Comment, Long>{

	@Override
	public void setRelation(Comment source, Long targetId, String fieldName) {
		Comment c=new Comment();
		c.setId(targetId);
		source.setOriginal(c);
	}

	@Override
	public void setRelations(Comment source, Iterable<Long> targetIds,
			String fieldName) {
		throw new UnsupportedOperationException();
		
		
	}

	@Override
	public void addRelations(Comment source, Iterable<Long> targetIds,
			String fieldName) {
		throw new UnsupportedOperationException();
		
		
	}

	@Override
	public void removeRelations(Comment source, Iterable<Long> targetIds,
			String fieldName) {
		throw new UnsupportedOperationException();
		
		
	}

	@Override
	public Comment findOneTarget(Long sourceId, String fieldName, QuerySpec querySpec) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ResourceList<Comment> findManyTargets(Long sourceId, String fieldName, QuerySpec querySpec) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Class<Comment> getSourceResourceClass() {
		return Comment.class;
	}

	@Override
	public Class<Comment> getTargetResourceClass() {
		return Comment.class;
	}



}
