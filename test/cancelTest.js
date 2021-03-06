var assert = require('chai').assert;
var helper = require('./testHelper');

describe('cancel', function() {

    var boss;

    before(function(finished){
        helper.start()
            .then(dabauce => {
                boss = dabauce;
                finished();
            });
    });
    
    after(function(finished){
        boss.stop().then(() => finished());
    });
    
    it('should cancel a pending job', function(finished){

        boss.subscribe('will_cancel', () => {
            assert(false, "job was cancelled, but still worked");
            finished();
        });

        boss.publish('will_cancel', null, {startIn: 1})
            .then(id => boss.cancel(id))
            .then(id => helper.getJobById(id))
            .then(result => {
                assert(result.rows.length && result.rows[0].state == 'cancelled');
                finished();
            });
    });
    
    it('should not cancel a completed job', function(finished){

        boss.subscribe('will_not_cancel', (job, done) => {
                done()
                    .then(() => boss.cancel(job.id))
                    .catch(() => {
                        assert(true);
                        finished();
                    });
            }
        );

        boss.publish('will_not_cancel');
    });

});