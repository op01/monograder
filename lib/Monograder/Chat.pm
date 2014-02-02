package Monograder::Chat;
use Mojo::Base 'Mojolicious::Controller';
use HTML::Entities;
my $clients = {};
sub chat{
	my $self = shift;
	print "Client connected\n";
	my $key = sprintf "%s",$self->tx;
	$clients->{$key} = $self->tx;
	$self->on(message => sub{
		my ($self,$msg) = @_;
		print "recv $msg\n";
		$msg = iWantTo($self,$msg);
		
		for(keys %$clients)
		{
			my $now = localtime;
			$clients->{$_}->send({json => {name=>encode_entities($self->stash->{name})||'user',text=>encode_entities($msg),hms=>$now}});
		}
	});
	$self->on(finish=>sub{
		print "Client $key disconnected\n";
		delete $clients->{$key};
	});
}

sub iWantTo
{
	my ($self,$msg) = @_;
	if($msg =~ /^I want to ([\s\w]+)$/)
	{
		print "iWantTo detected $1\n";
		if($1 =~ /^change my name (\w+)$/)
	 	{
	 		print "clinet change name\n";
	 		$msg = 'Changed name';
	 		$self->stash(name => $1);
	 	}
	 	else
	 	{
	 		$msg = "error";
	 	}
	}
	return $msg;
	
}

1;
