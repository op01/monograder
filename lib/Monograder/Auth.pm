package Monograder::Auth;
use Digest::MD5 qw(md5_hex);
use Mojo::Base 'Mojolicious::Controller';

sub login {
	my $self = shift;
	my $user = $self->param('user');
	my $pass = $self->param('pass');
	my $sth = $self->db->prepare('SELECT "uid" FROM "user" WHERE "username"=? AND "password"=?');
	$sth->bind_param(1,$user);
	$sth->bind_param(2,md5_hex($pass));
	$sth->execute();
	my $uid = $sth->fetchrow_arrayref();
	if($sth->rows())
	{
		$self->cookie(user => $uid->[0]);
		$self->cookie(pass => md5_hex($pass));
		return $self->redirect_to('/');
	}
	else
	{
		return $self->render('fail');
	}
}
sub logout
{
	my $self = shift;
	my $cookie = Mojo::Cookie::Response->new( name => 'pass', value => '', path => '/', expires => -1);
	$self->res->cookies($cookie);
	return $self->redirect_to('/');
}

sub auth1
{
	my $self = shift;
	$self->stash(userinfo => undef);
	if($self->cookie('user') and $self->cookie('pass'))
	{
		my $sth = $self->db->prepare('SELECT * FROM "user" WHERE "uid"=? AND "password"=?');
		$sth->bind_param(1,$self->cookie('user'));
		$sth->bind_param(2,$self->cookie('pass'));
		$sth->execute();
		my $userinfo = $sth->fetchrow_hashref();
		if($sth->rows())
		{
			$self->stash(userinfo => $userinfo);			
		}
		$sth->finish();
	}
	return 1;
}

sub auth2
{
	my $self = shift;
	unless($self->req->headers->referrer)
	{
		$self->render(text => 'คิดจะทำอะไรอยู่จ่ะ');
		return 0;
	}
	if($self->stash->{userinfo})
	{
		return 1;
	}
	$self->render('fail');
	return 0;
}

sub admin
{
	my $self =  shift;
	if($self->stash->{userinfo} and $self->stash->{userinfo}->{username} eq 'admin')
	{
		return 1;
	}
	$self->render('fail');
	return undef;
}
1;