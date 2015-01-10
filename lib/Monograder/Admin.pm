package Monograder::Admin;
use Digest::MD5 qw(md5_hex);
use Archive::Extract;
use File::Slurp;
use Mojo::Base 'Mojolicious::Controller';

sub scoreboard{
	my $self = shift;
	my $sth = $self->db->prepare('select "user"."username",count("yes"."yid") from "user" left join "yes" on "yes"."uid"="user"."uid" group by "user"."uid"');
	$sth->execute();
	$self->render(json=>$sth->fetchall_arrayref());
}

sub newuser{
	my $self = shift;
	my $user = $self->param('user');
	return $self->render(text => 'error') if !$user;
	my $pass = $self->param('pass');
	my $sth = $self->db->prepare('insert into "user" ("username","password") values (?,?)');
	$sth->bind_param(1,$user);
	$sth->bind_param(2,md5_hex($pass));
	$sth->execute();
	$self->render(text => 'ok');
}
sub user{
	my $self = shift;
	my $sth = $self->db->prepare('select "uid","username" from "user"');
	$sth->execute();
	$self->render(json => $sth->fetchall_arrayref());
}
sub removeuser {
	my $self = shift;
	my $sth = $self->db->prepare('delete from "user" where "uid"=?');
	$sth->bind_param(1,$self->stash->{'id'});
	$sth->execute();
	$sth = $self->db->prepare('delete from "submission" where "uid"=?');
	$sth->bind_param(1,$self->stash->{'id'});
	$sth->execute();
	$sth = $self->db->prepare('delete from "yes" where "uid"=?');
	$sth->bind_param(1,$self->stash->{'id'});
	$sth->execute();
	$self->render(text=>'OK');
}
sub newproblem
{
	my $self = shift;
	my $title = $self->param('title');
	my $file = $self->param('file');
	my $data = $file->slurp;
	my $sth = $self->db->prepare('insert into "problem" ("title","details") values (?,?)');
	$sth->bind_param(1,$title);
	$sth->bind_param(2,$data);
	$sth->execute();
	$self->render(text => "OK");
}
sub problemedit {
	my $self = shift;
	my $file = $self->param('file');
	my $data = $file->slurp;
	my $sth = $self->db->prepare('update "problem" set "details"=? where "pid"=?');
	$sth->bind_param(1,$data);
	$sth->bind_param(2,$self->param('id'));
	$sth->execute();
	$self->render(text => "OK");
}
sub testcasepack{
    my $self = shift;
    redirect_to('admin#newproblem') unless my $file=$self->param('file');
    $file->move_to('testcase_tmp/file');
    my $ae = Archive::Extract->new( archive => 'testcase_tmp/file',type=>'zip' );
    $ae->extract(to=>'./testcase_tmp');
    my $pid=$self->param('id');
    my $sth=$self->db->prepare('delete from "testcase" where pid=?');
    $sth->bind_param(1,$pid);
    $sth->execute();
    my $prefix="testcase_tmp/";
    for(my $i=1;;$i++)
    {
        last unless -f $prefix.$i.".in" && -f $prefix.$i.".sol";
        my $in=read_file($prefix.$i.".in");
        my $out=read_file($prefix.$i.".sol");
        $sth = $self->db->prepare('insert into "testcase" ("pid","in","out") values (?,?,?)');
    	$sth->bind_param(1,$pid);
    	$sth->bind_param(2,$in);
    	$sth->bind_param(3,$out);
    	$sth->execute();
    }
    unlink glob "testcase_tmp/*";
    $self->render(text => "OK");
}
sub newtestcase {
	my $self = shift;
	my $pid = $self->param('problem');
	my $in = $self->param('in')->slurp;
	my $out = $self->param('out')->slurp;
	my $sth = $self->db->prepare('insert into "testcase" ("pid","in","out") values (?,?,?)');
	$sth->bind_param(1,$pid);
	$sth->bind_param(2,$in);
	$sth->bind_param(3,$out);
	$sth->execute();
	$self->render(text => "OK");
}
sub testcase{
	my $self = shift;
	my $sth = $self->db->prepare('select "tid","in","out" from "testcase" where "pid"=?');
	$sth->bind_param(1,$self->param('id'));
	$sth->execute();
	$self->render(json => $sth->fetchall_arrayref());
}
sub testcaseedit {
	my $self = shift;
	my $sth = $self->db->prepare('update "testcase" set "in"=?,"out"=? where "tid"=?');
	$sth->bind_param(1,$self->param('in'));
	$sth->bind_param(2,$self->param('out'));
	$sth->bind_param(3,$self->stash->{'id'});
	$sth->execute();
	$self->render(text => "OK");
}

sub removeproblem{
	my $self = shift;
	my $sth = $self->db->prepare('delete from "problem" where "pid"=?');
	$sth->bind_param(1,$self->stash->{'id'});
	$sth->execute();
	$sth = $self->db->prepare('delete from "submission" where "pid"=?');
	$sth->bind_param(1,$self->stash->{'id'});
	$sth->execute();
	$sth = $self->db->prepare('delete from "testcase" where "pid"=?');
	$sth->bind_param(1,$self->stash->{'id'});
	$sth->execute();
	$sth = $self->db->prepare('delete from "yes" where "pid"=?');
	$sth->bind_param(1,$self->stash->{'id'});
	$sth->execute();
	$self->render(text=>'OK');
}

1;