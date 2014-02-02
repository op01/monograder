package Monograder;
use Mojo::Base 'Mojolicious';
use DBI;
# This method will run once at server start
sub startup {
  my $self = shift;
  # Documentation browser under "/perldoc"
  $self->plugin('PODRenderer');
  my $db = DBI->connect(          
    "dbi:SQLite:dbname=grader.db", 
    "",                          
    "",                          
    { RaiseError => 1,sqlite_unicode => 1}        
) or die $DBI::errstr;
  $self->helper(db => sub{ $db } );
  # Router
  my $r = $self->routes;
  $r->post('/login')->to('auth#login')->name('login');
  $r = $r->under('/')->to('auth#auth1');
  $r->get('/')->to('page#index')->name('index');
  $r = $r->under('/')->to('auth#auth2');
  $r->websocket('/chat')->to('chat#chat')->name('chat');
  $r->get('/logout')->to('auth#logout');
  $r->get('/problem')->to('user#problem');
  $r->get('/problem/:id')->to('user#problemid');
  $r->get('/problem/:id/view/:filename')->to('user#problemview');
  $r->post('/submit')->to('user#submit');
  $r->get('/result/:page')->to('user#result');
  $r->get('/src/:id')->to('user#viewsrc');
  $r->get('/scoreboard')->to('user#scoreboard');
  my $admin = $r->under('/admin')->to('auth#admin');
  $admin->get('/user')->to('admin#user');
  $admin->post('/user')->to('admin#newuser');
  $admin->delete('/user/:id')->to('admin#removeuser');
  $admin->post('/problem')->to('admin#newproblem');
  $admin->post('/problem/:id')->to('admin#problemedit');
  $admin->get('/problem/:id')->to('admin#removeproblem');
  $admin->post('testcase')->to('admin#newtestcase');
  $admin->get('/testcase/:id')->to('admin#testcase');
  $admin->post('/testcase/:id')->to('admin#testcaseedit');
}
1;
