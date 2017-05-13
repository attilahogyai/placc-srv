package com.myplacc.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.myplacc.domain.comment.Comment;
import com.myplacc.domain.user.Session;
import com.myplacc.util.BBCodeParser;
import com.myplacc.web.controller.RequestWrapper;

import io.katharsis.queryspec.QuerySpec;
import io.katharsis.repository.RelationshipRepositoryV2;
import io.katharsis.repository.ResourceRepositoryV2;
import io.katharsis.resource.list.ResourceList;

@Component(value="commentServiceImpl")
public class CommentServiceImpl extends AbstractService implements ResourceRepositoryV2<Comment, Long>,
RelationshipRepositoryV2<Comment, Long, Session, String>{
	@Autowired
	private CommentDaoMapper commentMapper;
	@Override
	public Comment findOne(Long id, QuerySpec querySpec) {
		return commentMapper.findOne(id);
	}

	@Override
	public ResourceList<Comment> findAll(QuerySpec querySpec) {
		return null;
		
	}


	@Override
	public <S extends Comment> S save(S entity) {
		Session s=new Session();
		s.setCode(RequestWrapper.getSession().getCode()); // the session code should be copied from active session  
		entity.setSession(s.getCode());	
		entity.setStatus(1);
		entity.setComment(BBCodeParser.parseString(entity.getComment()));
		commentMapper.insertComment(entity);
		return entity;
	}

	@Override
	public void delete(Long id) {
		throw new UnsupportedOperationException();
		
		
	}

	@Override
	public void setRelation(Comment source, String targetId, String fieldName) {
		Session s=new Session();
		s.setCode(RequestWrapper.getSession().getCode()); // the session code should be copied from active session  
		source.setSession(s.getCode());
		commentMapper.updateComment(source);
	}

	@Override
	public void setRelations(Comment source, Iterable<String> targetIds,
			String fieldName) {
		throw new UnsupportedOperationException();
		
		
	}

	@Override
	public void addRelations(Comment source, Iterable<String> targetIds,
			String fieldName) {
		throw new UnsupportedOperationException();
		
		
	}

	@Override
	public void removeRelations(Comment source, Iterable<String> targetIds,
			String fieldName) {
		throw new UnsupportedOperationException();
		
		
	}

	@Override
	public Class<Comment> getSourceResourceClass() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Class<Session> getTargetResourceClass() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Session findOneTarget(Long sourceId, String fieldName, QuerySpec querySpec) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ResourceList<Session> findManyTargets(Long sourceId, String fieldName, QuerySpec querySpec) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Class<Comment> getResourceClass() {
		return Comment.class;
	}

	@Override
	public ResourceList<Comment> findAll(Iterable<Long> ids, QuerySpec querySpec) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public <S extends Comment> S create(S entity) {
		// TODO Auto-generated method stub
		return null;
	}


}
