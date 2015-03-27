#!/usr/bin/env plackup -s FCGI
use Mojo::Server::PSGI;
use Plack::Builder;

builder {
  my $server = Mojo::Server::PSGI->new;
  $server->load_app('./script/monograder');
  $server->app->config(foo => 'bar');
  $server->to_psgi_app;
};