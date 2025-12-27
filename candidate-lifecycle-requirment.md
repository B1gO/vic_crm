## Candidate Lifecycle Requirements
### SOURCING
SOURCED： 刚录入信息到系统
SCREENING_SCHEDULED： 已预约 for training or direct marketing.
SCREENING_PASSED： 已通过
SCREENING_FAILED： 已失败
Contract_Sent： 已发送合同 
Contract_Signed： 已签订合同 （事件驱动，signed contract 需要在document那里上传）
Batch assigned： 已分配批次
DIRECT_MARKETING_READY： 已准备好直接营销

### TRAINING
when batch is started, 该事件会驱动所有batch assigned的candidate进入training stage
when batch is ended, 该事件会驱动所有batch assigned的candidate进入post training stage

### POST TRAINING
resume (resume prepare, resume ready)

mock(Theory Mock, Real Mock)
theory mock passed, then can schedule real mock
theory mock failed, then can retake theory mock

### MARKETING
if the candiate passed the real mock, 事件驱动，进入marketing stage

如果我通过submission按钮提交该candidate，事件驱动，会把该submission的event写入timeline. 可以认为submission的事件是marketing过程中发生的事情，类似于子stage,
比如我提交了vendor bayone for OA, 那么会计入timeline bayone OA, if OA pass,会记录OA pass.
然后我又提交了vendor infobahn, infobahn 没有OA，直接安排了vendor screening， 那么该事件也会计入。 之后又安排了client面试，client面试分为round 1 or round 2 or more.
比如我又提交了radstand, 直接安排了client面试。比如是Walmart的面试。
所以这里的事件比较复杂。我希望这里全是由submission那里来驱动更新timeline.
timeline也最好按照vendor来分支，即子timeline。

### INTERVIEWING
不再需要

### OFFERED
如果candidate pass了面试，拿了offer，那么事件驱动，进入offered stage
offer分为两种，一种是W2，一种是C2C

### PLACED
如果candidate接受了offer，并成功入职。会我工作人人员点击palced.
placed的candidate 在几个月后因为合同结束，可能会回到marketing。

### ON_HOLD
如果candidate由于个人原因，选择暂停培训，或者暂停marketing， 工作人员点击onhold
on_hold状态可以被变为其它状态，比如training.

### ELIMINATED
candiate 被开除。


一些事件驱动的状态，应该也能支持人工改变，比如一个batch已经开始了，招进来了一个人。加入了该batch， 那么recruiter可以把他调为training stage.

