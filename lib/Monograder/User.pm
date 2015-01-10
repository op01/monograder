package Monograder::User;
use Mojo::Base 'Mojolicious::Controller';

sub problem{
	my $self = shift;
	my $sth = $self->db->prepare('select "problem"."pid","problem"."title",count("submission"."sid"),"yes"."yid"
from "problem" left join"submission" 
	on "problem"."pid"="submission"."pid" and "submission"."uid"=?
left join  "yes"
	on "problem"."pid"="yes"."pid" and "yes"."uid"=?
group by "problem"."pid" 
order by "problem"."pid" asc');
	$sth->bind_param(1,$self->stash->{userinfo}->{uid});
	$sth->bind_param(2,$self->stash->{userinfo}->{uid});
	$sth->execute();
	$self->render(json=>$sth->fetchall_arrayref());
	$sth->finish();
}
sub problemid{
	my $self = shift;
	my $sth = $self->db->prepare('select "pid","title" from "problem" where pid=?');
 	$sth->bind_param(1,$self->param('id'));
	$sth->execute();
	$self->render(json=>$sth->fetchrow_arrayref());
	$sth->finish();
}
sub problemview {
	my $self = shift;
	my $sth = $self->db->prepare('select "details" from "problem" where "pid"=?');
	$sth->bind_param(1,$self->param('id'));
	$sth->execute();
	my $res = $sth->fetchrow_arrayref();
	my $bytes = $res->[0];
	$self->res->headers->content_type('application/pdf');
	$self->res->headers->content_disposition('attachment');
	$self->render(data => $bytes);
	$sth->finish();
}
sub submit
{
	my $self = shift;
	# Check file size
	return $self->render(text => 'File is too big.', status => 200)
		if $self->req->is_limit_exceeded;
	my $code = $self->param('code')->slurp;
	my $sth = $self->db->prepare('insert into "submission" ("uid","pid","code","status") values (?,?,?,\'waiting\')');
	$sth->bind_param(1,$self->stash->{userinfo}->{uid});
	$sth->bind_param(2,$self->param('id'));
	$sth->bind_param(3,$code);
	$sth->execute();
	$sth->finish();
	return $self->redirect_to('/#result');
}

sub result {
	my $self = shift;
	my $sth;
	if($self->stash->{userinfo}->{username} eq 'admin'){$sth=$self->db->prepare('select "submission"."sid","user"."username","problem"."title","submission"."status","submission"."result" from "submission" inner join "user" inner join "problem" on "submission"."uid"="user"."uid" and "submission"."pid"="problem"."pid" order by "sid" desc limit ? ,?');}
	else{$sth=$self->db->prepare('select "submission"."sid","user"."username","problem"."title","submission"."status","submission"."result" from "submission" inner join "user" inner join "problem" on "submission"."uid"="user"."uid" and "submission"."pid"="problem"."pid" where "submission"."uid" = ? order by "sid" desc limit ? ,?');}
	$sth->bind_param(1,$self->stash->{userinfo}->{uid});
	$sth->bind_param(2,$self->param('page')*10);
	$sth->bind_param(3,10);
	$sth->execute();
	$self->render(json=>$sth->fetchall_arrayref);
}

sub viewsrc{
	my $self = shift;
	my $sth = $self->db->prepare('select "uid","code" from "submission" where "sid"=?');
	$sth->bind_param(1,$self->param('id'));
	$sth->execute();
	my $res = $sth->fetchrow_arrayref();
	if($self->stash->{userinfo}->{username} eq 'admin' or $res->[0] == $self->stash->{userinfo}->{uid})
	{
		$self->res->headers->content_type('text/plain');
		#$self->res->headers->content_disposition('attachment');
		$self->render(text=>"/* Monograder\n Submission ID:".$self->param('id')." */\n".$res->[1]);
	}
	else
	{
		$self->render('fail');
	}
	$sth->finish();
}

1;