package com.smartcourier.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertEvent;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

/**
 * Generates stable, human-friendly Long IDs for MongoDB documents.
 * MongoDB normally uses ObjectId strings, but the existing REST contract
 * uses Long IDs, so this listener preserves that API without requiring
 * changes to the frontend.
 */
@Component
public class MongoIdGenerator extends AbstractMongoEventListener<Object> {

    private static final String SEQUENCE_COLLECTION = "database_sequences";

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public void onBeforeConvert(BeforeConvertEvent<Object> event) {
        Object entity = event.getSource();
        if (!entity.getClass().getPackageName().equals("com.smartcourier.entity")) {
            return;
        }
        Long currentId = getId(entity);

        if (currentId == null) {
            long nextId = nextId(event.getCollectionName());
            setId(entity, nextId);
        }
    }

    private long nextId(String collectionName) {
        Query query = Query.query(Criteria.where("_id").is(collectionName));
        Update update = new Update().inc("seq", 1);
        FindAndModifyOptions options = FindAndModifyOptions.options()
                .upsert(true)
                .returnNew(true);

        Sequence sequence = mongoTemplate.findAndModify(
                query,
                update,
                options,
                Sequence.class,
                SEQUENCE_COLLECTION
        );

        if (sequence == null || sequence.getSeq() == null) {
            throw new IllegalStateException("Unable to generate MongoDB ID for collection: " + collectionName);
        }
        return sequence.getSeq();
    }

    private Long getId(Object entity) {
        try {
            Method method = entity.getClass().getMethod("getId");
            return (Long) method.invoke(entity);
        } catch (Exception e) {
            return null;
        }
    }

    private void setId(Object entity, long id) {
        try {
            Method method = entity.getClass().getMethod("setId", Long.class);
            method.invoke(entity, id);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to set MongoDB ID on " + entity.getClass().getSimpleName(), e);
        }
    }

    public static class Sequence {
        private String id;
        private Long seq;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public Long getSeq() { return seq; }
        public void setSeq(Long seq) { this.seq = seq; }
    }
}
